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
    this.client = ZoomVideo.createClient(); // ここでクライアントを作成

    this.client.init('en-US').then(() => {
      console.log('Zoom Video SDK initialized');

      this.client.join(this.sessionName, this.userToken, this.userName).then(() => {
        console.log('User joined the meeting');

        const localVideoElement = document.getElementById('localVideo');

        // ここでカメラを開始する前に、ビデオストリームを取得
        this.client.startVideo().then(() => {
          console.log('Video started successfully');
        }).catch((error) => {
          console.error('Error starting video:', error);
        });

        // イベントリスナーを設定
        this.client.on('stream-added', (evt: any) => {
          const stream = evt.stream;
          if (stream.getType() === 'local') {
            stream.play(localVideoElement);
          }
        });
      }).catch((error) => {
        console.error('Error joining meeting:', error);
      });
    }).catch((error) => {
      console.error('Error initializing Zoom Video SDK:', error);
    });
  }
}
