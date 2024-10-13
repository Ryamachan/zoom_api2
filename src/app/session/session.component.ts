import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.css'],
})
export class SessionComponent implements OnInit {
  private client: any; // Zoom Video SDKクライアント
  private meetingId: string;
  private userName: string;
  private userToken: string;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.userToken = params['config'].videoSDKJW;
      this.userName = params['config'].userName;
      this.sessionName = params['config'].sessionName; // ここに実際のミーティングIDを設定
    });

    this.startVideoSession();
  }

  startVideoSession() {
    // Zoom Video SDKのクライアントを作成
    this.client = ZoomVideo.createClient();

    // SDKの初期化
    this.client.init('en-US');

    // ミーティングに参加
    this.client.join(this.sessionName, this.userName, this.userToken).then(() => {
      console.log('User joined the meeting');

      // ローカルビデオを表示
      const localVideoElement = document.getElementById('localVideo');
      this.client.startVideo();

      // イベントリスナーを設定
      this.client.on('stream-added', (evt) => {
        const stream = evt.stream;
        if (stream.getType() === 'local') {
          stream.play(localVideoElement);
        }
      });
    }).catch((error) => {
      console.error('Error joining meeting:', error);
    });
  }
}
