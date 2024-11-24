import { Component, OnInit, ViewChild } from '@angular/core';
import { VideoService } from '../services/video.service';
import { WebSocketSubject } from 'rxjs/webSocket';  // WebSocketSubjectをインポート

@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.css']
})
export class SessionComponent implements OnInit {
  @ViewChild('videoElement') videoElement: any;
  @ViewChild('canvasElement') canvasElement: any;

  private socket!: WebSocketSubject<any>;  // 初期化を強制するため`!`を追加
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: any[] = [];

  constructor(private videoService: VideoService) {}

  ngOnInit() {
    // `receiveFrame()` が WebSocketSubject を返すようにする
    this.socket = this.videoService.receiveFrame() as WebSocketSubject<any>;

    this.socket.subscribe(
      (frameData: Blob) => {
        this.displayFrameOnCanvas(frameData);
      },
      (error: Error) => {
        console.error('WebSocket error:', error);
      }
    );

    this.startCamera();
  }

  startCamera() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        // カメラ映像をvideoElementに表示
        this.videoElement.nativeElement.srcObject = stream;
        this.videoElement.nativeElement.play();

        // canvasからストリームをキャプチャ
        const canvasStream = this.canvasElement.nativeElement.captureStream(30); // 30fpsでキャプチャ

        // MediaRecorderをcanvasStreamに変更
        this.mediaRecorder = new MediaRecorder(canvasStream, { mimeType: 'video/webm' });

        // 録画データが収集されたら
        this.mediaRecorder.ondataavailable = (event) => {
          this.recordedChunks.push(event.data);
        };

        // 録画停止時に処理を実行
        this.mediaRecorder.onstop = () => {
          this.saveRecordedVideo();
        };

        // 録画を開始
        this.mediaRecorder.start();
      })
      .catch(error => {
        console.error('Error accessing camera:', error);
      });
  }

  // 録画開始処理
  startRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'inactive') {
      this.mediaRecorder.start();
      console.log('Recording started');
    }
  }

  // 録画停止処理
  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
      console.log('Recording stopped');
    }
  }

  // カメラ映像をCanvasに描画し、サーバーに送信する
  captureFrame() {
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');
    const video = this.videoElement.nativeElement;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Canvasから画像データを取得
    canvas.toBlob((blob: Blob) => {
      this.sendFrameToServer(blob); // サーバーに送信
    });
  }

  sendFrameToServer(frame: Blob) {
    this.videoService.sendFrame(frame); // フレームデータを送信
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

  // 録画が終了したら、録画データを保存
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
