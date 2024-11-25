import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { VideoService } from '../services/video.service';
import { WebSocketSubject } from 'rxjs/webSocket';  // WebSocketSubjectをインポート

@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.css']
})
export class SessionComponent implements OnInit, AfterViewInit {
  @ViewChild('videoElement') videoElement: any;
  @ViewChild('canvasElement') canvasElement: any;

  private socket!: WebSocketSubject<any>;  // 初期化を強制するため`!`を追加
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: any[] = [];
  private isRecording: boolean = false;

  constructor(private videoService: VideoService) {}

  ngOnInit() {
    // WebSocket接続の確立
    this.socket = this.videoService.receiveFrame() as WebSocketSubject<any>;

    // サーバーから処理されたフレームデータを受け取る
    this.socket.subscribe(
      (frameData: Blob) => {
        console.log("websocket work");
        this.displayFrameOnCanvas(frameData);  // 処理されたフレームをcanvasに表示
      },
      (error: Error) => {
        console.error('WebSocket error:', error);
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
        // カメラ映像をvideoElementに表示
        if (this.videoElement && this.videoElement.nativeElement) {
          this.videoElement.nativeElement.srcObject = stream;
          this.videoElement.nativeElement.play();
        }

        // canvasからストリームをキャプチャ
        if (this.canvasElement && this.canvasElement.nativeElement) {
          const canvasStream = this.canvasElement.nativeElement.captureStream(30); // 30fpsでキャプチャ

          // MediaRecorderをcanvasStreamに設定
          this.mediaRecorder = new MediaRecorder(canvasStream, { mimeType: 'video/webm' });

          // 録画データが収集されたら
          this.mediaRecorder.ondataavailable = (event) => {
            this.recordedChunks.push(event.data);  // 録画データが収集される
          };

          // 録画停止時に処理を実行
          this.mediaRecorder.onstop = () => {
            this.saveRecordedVideo();  // 録画停止後に保存処理
          };
        }

        // カメラ映像をサーバーに送信して処理する
        this.captureFrame();
      })
      .catch(error => {
        console.error('Error accessing camera:', error);
      });
  }

  // カメラ映像をキャプチャしてサーバーに送信
  captureFrame() {
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');
    const video = this.videoElement.nativeElement;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Canvasから画像データを取得し、サーバーに送信
    canvas.toBlob((blob: Blob) => {
      this.sendFrameToServer(blob);  // サーバーに送信
    });

    // フレームの取得を繰り返す
    requestAnimationFrame(() => this.captureFrame());
  }

  // フレームデータをサーバーに送信
  sendFrameToServer(frame: Blob) {
    this.videoService.sendFrame(frame); // サーバーにフレームデータを送信
  }

  // サーバーから返されたフレームをCanvasに描画
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

  // 録画開始
  startRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'inactive') {
      this.mediaRecorder.start();
      this.isRecording = true;
      console.log('Recording started');
    }
  }

  // 録画停止
  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
      this.isRecording = false;
      console.log('Recording stopped');
    }
  }

  // 録画データを保存
  saveRecordedVideo() {
    const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
    const videoURL = URL.createObjectURL(blob);

    // 録画した動画を保存
    const a = document.createElement('a');
    a.href = videoURL;
    a.download = 'recorded-video.webm';
    a.click();

    // メモリの解放
    URL.revokeObjectURL(videoURL);
    this.recordedChunks = [];
  }
}
