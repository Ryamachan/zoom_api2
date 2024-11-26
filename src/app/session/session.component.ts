import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { VideoService } from '../services/video.service';
import { WebSocketSubject } from 'rxjs/webSocket';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.css']
})
export class SessionComponent implements OnInit, AfterViewInit {
  @ViewChild('videoElement') videoElement: any;
  @ViewChild('canvasElement') canvasElement: any;

  private socket!: WebSocketSubject<any>;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: any[] = [];
  private isRecording: boolean = false;
  public errorMessage: string | null = null;  // エラーメッセージを格納する変数

  constructor(private videoService: VideoService) {}


  ngOnInit() {
    // WebSocket接続の確立
    this.socket = this.videoService.receiveFrame() as WebSocketSubject<any>;

    this.socket.pipe(
      catchError(error => {
        console.error('WebSocket error caught:', error);  // WebSocketエラーをキャッチ
        this.errorMessage = `WebSocket Error: ${error.message}`;  // ユーザーにエラーを表示
        return [];
      })
    ).subscribe(
      (frameData: Blob) => {
        console.log("Received frame data from WebSocket");
        this.displayFrameOnCanvas(frameData);
      },
      (error: Error) => {
        console.error('WebSocket error:', error);
        this.errorMessage = `WebSocket Error: ${error.message}`;
      },
      () => {
        console.log("WebSocket connection closed");
      }
    );
  }

  ngAfterViewInit() {
    this.startCamera();  // カメラ映像の取得を開始
  }

  // カメラ映像を取得して処理する
  startCamera() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        if (this.videoElement && this.videoElement.nativeElement) {
          this.videoElement.nativeElement.srcObject = stream;
          this.videoElement.nativeElement.play();
        }

        if (this.canvasElement && this.canvasElement.nativeElement) {
          const canvasStream = this.canvasElement.nativeElement.captureStream(30);
          this.mediaRecorder = new MediaRecorder(canvasStream, { mimeType: 'video/webm' });

          this.mediaRecorder.ondataavailable = (event) => {
            this.recordedChunks.push(event.data);
          };

          this.mediaRecorder.onstop = () => {
            this.saveRecordedVideo();
          };
        }

        this.captureFrame();
      })
      .catch((error) => {
        console.error('Error accessing camera:', error);
        this.errorMessage = `Camera Error: ${error.name} - ${error.message}`;  // エラーメッセージの表示
      });
  }

  captureFrame() {
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');
    const video = this.videoElement.nativeElement;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob: Blob) => {
      this.sendFrameToServer(blob);
    });

    requestAnimationFrame(() => this.captureFrame());
  }

  sendFrameToServer(frame: Blob) {
    this.videoService.sendFrame(frame);
  }

  displayFrameOnCanvas(frameData: Blob) {
    const img = new Image();
    const objectURL = URL.createObjectURL(frameData);
    img.src = objectURL;

    img.onload = () => {
      const context = this.canvasElement.nativeElement.getContext('2d');
      context.drawImage(img, 0, 0);
      URL.revokeObjectURL(objectURL);
    };
  }

  startRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'inactive') {
      this.mediaRecorder.start();
      this.isRecording = true;
      console.log('Recording started');
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
      this.isRecording = false;
      console.log('Recording stopped');
    }
  }

  saveRecordedVideo() {
    const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
    const videoURL = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = videoURL;
    a.download = 'recorded-video.webm';
    a.click();

    URL.revokeObjectURL(videoURL);
    this.recordedChunks = [];
  }
}
