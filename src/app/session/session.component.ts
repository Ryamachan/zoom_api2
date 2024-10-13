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
      console.log(this.userToken);
      console.log(this.userName);
      console.log(this.sessionName);
    });

    this.startVideoSession();
  }

  startVideoSession() {
    // Zoom Video SDKのクライアントを作成
    this.client = ZoomVideo.createClient(); // ここでクライアントを作成

    // SDKの初期化
    this.client.init('en-US').then(() => {
        // ミーティングに参加
        this.client.join(this.sessionName, this.userToken, this.userName).then(() => {
            console.log('User joined the meeting');

            // ローカルビデオを表示
            const localVideoElement = document.getElementById('localVideo');
            this.client.startVideo(); // ここでビデオを開始

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
