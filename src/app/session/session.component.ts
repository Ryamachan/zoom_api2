import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import ZoomVideo from '@zoom/videosdk'; // ZoomVideoのインポートを追加

@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.css'],
})
export class SessionComponent {
  @ViewChild('cameraVideo') cameraVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('uploadedVideo') uploadedVideo!: ElementRef<HTMLVideoElement>;

  private mediaRecorder!: MediaRecorder;
  private chunks: Blob[] = [];
  private stream!: MediaStream;

  async ngAfterViewInit() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      this.cameraVideo.nativeElement.srcObject = this.stream;
    } catch (error) {
      console.error('Error accessing media devices.', error);
    }
  }

  startRecording() {
    this.chunks = [];
    this.mediaRecorder = new MediaRecorder(this.stream);

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.chunks.push(event.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      const blob = new Blob(this.chunks, { type: 'video/webm' });
      this.uploadedVideo.nativeElement.src = URL.createObjectURL(blob);
      this.uploadedVideo.nativeElement.load();
      this.uploadedVideo.nativeElement.play();
    };

    this.mediaRecorder.start();
    console.log('Recording started');
  }

  stopRecording() {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      console.log('Recording stopped');
    }
  }
}
