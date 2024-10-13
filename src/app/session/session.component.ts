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
    // Zoom Video SDKのクライアントを作成
    this.client = ZoomVideo.createClient();

    // SDKの初期化
    this.client.init('en-US').then(() => {
      // ミーティングに参加
      this.client.join(this.sessionName, this.userToken, this.userName).then(() => {
        console.log('User joined the meeting');

        // ビデオを開始する前にストリームを取得する
        this.client.startVideo().then(() => {
          console.log('Video started successfully'); // ビデオが開始されたことを確認

          const localVideoElement = document.getElementById('localVideo');
          this.client.on('stream-added', (evt: any) => {
            const stream = evt.stream;
            if (stream.getType() === 'local') {
              stream.play(localVideoElement);
            }
          });
        }).catch((error:any) => {
          console.error('Error starting video:', error);
        });
      }).catch((error:any) => {
        console.error('Error joining meeting:', error);
      });
    }).catch((error:any) => {
      console.error('Error initializing Zoom Video SDK:', error);
  });
}
