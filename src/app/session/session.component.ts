import { Component, ElementRef, ViewChild } from '@angular/core';
import { VideoService } from '../services/video.service';

@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.css']
})
export class SessionComponent {
  @ViewChild('cameraVideo') cameraVideo!: ElementRef<HTMLVideoElement>;

  constructor(private videoService: VideoService) {}

  async ngAfterViewInit() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.cameraVideo.nativeElement.srcObject = stream;
      this.cameraVideo.nativeElement.onloadedmetadata = () => {
        this.cameraVideo.nativeElement.play();
      };
    } catch (error) {
      console.error('Error accessing the camera:', error);
    }
  }

  async captureAndSendFrame() {
    const videoElement = this.cameraVideo.nativeElement;
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const context = canvas.getContext('2d');

    if (context) {
      context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          console.log(blob);
          console.log("Captured frame, sending to server...");
          this.videoService.processVideoFrame(blob).subscribe(
            response => {
              console.log('Segmentation result:', response);
            },
            error => {
              console.error('Error processing video frame:', error);
            }
          );
        } else {
          console.error('Blob creation failed');
        }
      }, 'image/jpeg');
    } else {
      console.error('Canvas context is null');
    }
  }
}
