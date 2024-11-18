import { Component, OnInit } from '@angular/core';
import { VideoService } from '../services/video.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.css']
})
export class SessionComponent implements OnInit {
  private mediaRecorder!: MediaRecorder;
  private recordedChunks: Blob[] = [];
  private videoStream!: MediaStream;
  private frameInterval: any;

  constructor(private httpClient: HttpClient, private videoService: VideoService) {}

  ngOnInit(): void {
    this.startCamera();
    this.videoService.getCsrfToken().subscribe(() => {
      console.log('CSRF Token received and cookie set');
    });
  }

  // カメラを起動
  async startCamera() {
    try {
      this.videoStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      const videoElement = document.querySelector('video');
      if (videoElement) {
        videoElement.srcObject = this.videoStream;
        videoElement.play();
      }
    } catch (error) {
      // errorがError型であることを明示的に指定
      if ((error as Error).name === "NotReadableError") {
        console.error("カメラがすでに使用中です。カメラを使用している他のアプリケーションを閉じてください。");
      } else {
        console.error("カメラアクセス中にエラーが発生しました:", error);
      }
    }
  }


  // 録画開始
  startRecording() {
    this.recordedChunks = [];
    this.mediaRecorder = new MediaRecorder(this.videoStream, { mimeType: 'video/webm' });
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };
    this.mediaRecorder.start(100); // 100ms ごとにフレームをキャプチャ
    this.frameInterval = setInterval(() => this.sendFrame(), 100); // 毎秒1回フレームを送信
  }

  // 録画停止
  stopRecording() {
    this.mediaRecorder.stop();
    clearInterval(this.frameInterval); // 送信を停止
  }

  // 録画したフレームをサーバーに送信
  sendFrame() {
    if (this.recordedChunks.length === 0) return;

    const frameBlob = this.recordedChunks.shift();

    // `frameBlob`がundefinedでないことを確認
    if (!frameBlob) {
      console.error('No frame available for processing');
      return;
    }

    const formData = new FormData();
    formData.append('frame', frameBlob, 'frame.jpg');

    // CSRFトークンを取得
    const csrfToken = this.videoService.getCookie('XSRF-TOKEN') || ''; // nullの場合は空文字を代入

    this.httpClient.post('http://localhost:8000/api/process-video', formData, {
      headers: { 'X-XSRF-TOKEN': csrfToken },
      withCredentials: true
    }).subscribe(
      (response) => {
        console.log('Processed frame response', response);
      },
      (error) => {
        console.error('Error processing frame', error);
      }
    );
  }

}
