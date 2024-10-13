import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import  ZoomVideo  from '@zoom/videosdk'; // ZoomVideoのインポートを追加


@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.css'],
})
export class SessionComponent implements OnInit {
  private client!: any; // Zoom Video SDKクライアント
  private sessionName!: string;
  private userName!: string;
  private userToken!: string;
  private password!: string;
  private stream!: any;
  private resolution = { width: 1280, height: 720 };

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.userToken = params['jwt']; // jwtを取得
      this.userName = params['name']; // nameを取得
      this.sessionName = params['sessionName']; // sessionNameを取得
    });

    this.startVideoSession();
  }


  startVideoSession() {
    this.client = ZoomVideo.createClient(); // クライアントの作成
    this.client.init('en-US').then(() => {
      console.log('Zoom Video SDK initialized');

      this.client.join(this.sessionName, this.userToken, this.userName).then(() => {
        this.stream = this.client.getMediaStream();
        console.log('User joined the meeting');

        const localVideoElement = document.getElementById('localVideo');

        // カメラを開始する前に、ビデオストリームを取得
        this.stream.startVideo().then(() => {
          console.log('Video started successfully');

          this.stream.attachVideo(this.client.getCurrentUserInfo().userId, this.resolution).then((userVideo: HTMLVideoElement) => {
            const videoContainer = document.querySelector('video-player-container');
            if (videoContainer) {
              videoContainer.appendChild(userVideo);
            } else {
              console.error('Video player container not found.');
            }
          }).catch((error:any) => {
            console.error('Error attaching video:', error);
          });
        }).catch((error: any) => {
          console.error('Error starting video:', error);
        });

      }).catch((error: any) => {
        console.error('Error joining meeting:', error);
      });
    }).catch((error: any) => {
      console.error('Error initializing Zoom Video SDK:', error);
    });
  }
}

// イベントリスナーを設定\
/*
stream.on('stream-added', (evt: any) => {
  const stream = evt.stream;
  if (stream.getType() === 'local') {
    stream.play(localVideoElement);
  }
});*/
