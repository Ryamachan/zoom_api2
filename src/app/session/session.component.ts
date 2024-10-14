import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import ZoomVideo from '@zoom/videosdk'; // ZoomVideoのインポートを追加

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
  private stream!: any;

  private isAudioMuted: boolean = false; // オーディオのミュート状態を管理
  private isVideoOn: boolean = true; // ビデオの状態を管理

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.userToken = params['jwt']; // jwtを取得
      this.userName = params['name']; // nameを取得
      this.sessionName = params['sessionName']; // sessionNameを取得
    });

    this.startVideoSession();
    this.loadVideo(); // 動画をロードするメソッドを追加

    // ブラウザバックやウィンドウ閉じた時の処理
    window.addEventListener('beforeunload', this.leaveSession);
  }

  ngOnDestroy() {
    // コンポーネントが破棄される際にクリーンアップ
    window.removeEventListener('beforeunload', this.leaveSession);
  }


  loadVideo() {
    const videoElement = document.getElementById('laravel-video') as HTMLVideoElement;
    if (videoElement) {
      videoElement.src = 'https://spiral-agent.com/api/getVideo'; // URLを設定
      videoElement.load(); // 動画をロード
    }
  }

  startVideoSession() {
    this.client = ZoomVideo.createClient(); // クライアントの作成
    this.client.init('en-US').then(() => {
      console.log('Zoom Video SDK initialized');

      this.client.join(this.sessionName, this.userToken, this.userName).then(() => {
        this.stream = this.client.getMediaStream();
        console.log('User joined the meeting');

        const selfVideo = document.getElementById('localVideo') as HTMLVideoElement; // 型を明示的に指定
        if (!selfVideo) {
          console.error('Self video element not found.');
          return;
        }
        // 自分のビデオを開始する
        this.stream.startVideo().then(() => {
          console.log('Self video started successfully');
          const cameralist = this.stream.getCameraList();
          let deviceId = "";
          for(let i = 0; i < cameralist.length; i++){
            if(cameralist[i]["label"].includes("front") || cameralist[i]["label"].includes("Front"))
            {
              deviceId = cameralist[i]["deviceId"];
            }
          }
          const localVideoTrack = ZoomVideo.createLocalVideoTrack(deviceId);
          console.log(cameralist);
          localVideoTrack.start(selfVideo).then(() => {
            console.log('Local video track started.');
          }).catch((error: any) => {
            console.error('Error starting local video track:', error);
          });

          // オーディオトラックを作成して開始する
          const localAudioTrack = ZoomVideo.createLocalAudioTrack();
          localAudioTrack.start().then(() => {
              console.log('Local audio track started successfully.');
              this.stream.startAudio(); // オーディオをオンにする
          }).catch((error: any) => {
              console.error('Error starting local audio track:', error);
          });

          // cloud recording でレコードを開始する
          const cloudRecording = this.client.getRecordingClient();
          cloudRecording.startCloudRecording();

        }).catch((error: any) => {
          console.error('Error starting self video:', error);
        });
      }).catch((error: any) => {
        console.error('Error joining meeting:', error);
      });
    }).catch((error: any) => {
      console.error('Error initializing Zoom Video SDK:', error);
    });
      // ボタンにイベントリスナーを追加
     document.getElementById('microphone-button')?.addEventListener('click', () => this.toggleAudio());
     document.getElementById('video-button')?.addEventListener('click', () => this.toggleVideo());
     document.getElementById('send-button')?.addEventListener('click', () => this.sendMessage());
     document.getElementById('settings-button')?.addEventListener('click', () => this.showSettings());
     document.getElementById('close-settings-button')?.addEventListener('click', () => this.closeSettings());
  }

  leaveSession = () => {
    if (this.client) {
      this.client.leave(true); // セッションを終了
      console.log('User left the meeting');
    }
  }

  toggleAudio() {
    if (this.isAudioMuted) {
      this.stream.startAudio().then(() => {
        console.log('Audio started');
        this.isAudioMuted = false;
        (document.getElementById('microphone-button') as HTMLButtonElement).innerText = 'Mute';
      }).catch((error: any) => {
        console.error('Error starting audio:', error);
      });
    } else {
      this.stream.stopAudio().then(() => {
        console.log('Audio stopped');
        this.isAudioMuted = true;
        (document.getElementById('microphone-button') as HTMLButtonElement).innerText = 'Unmute';
      }).catch((error: any) => {
        console.error('Error stopping audio:', error);
      });
    }
  }

  toggleVideo() {
    if (this.isVideoOn) {
      this.stream.stopVideo().then(() => {
        console.log('Video stopped');
        this.isVideoOn = false;
        (document.getElementById('video-button') as HTMLButtonElement).innerText = 'Start Video';
      }).catch((error: any) => {
        console.error('Error stopping video:', error);
      });
    } else {
      this.stream.startVideo().then(() => {
        console.log('Video started');
        this.isVideoOn = true;
        (document.getElementById('video-button') as HTMLButtonElement).innerText = 'Stop Video';
      }).catch((error: any) => {
        console.error('Error starting video:', error);
      });
    }
  }

  sendMessage() {
    const message = (document.getElementById('chat-input') as HTMLTextAreaElement).value;
    if (message) {
      // メッセージを送信するロジックを実装（サーバー経由など）
      console.log('Sending message:', message);

      // チャットの出力エリアに追加
      const chatOutput = document.getElementById('chat-output');
      if (chatOutput) {
        chatOutput.innerHTML += `<p>${message}</p>`;
      }

      // 入力をクリア
      (document.getElementById('chat-input') as HTMLTextAreaElement).value = '';
    }
  }

  showSettings() {
    const settingsModal = document.getElementById('settings-modal');
    if (settingsModal) {
      settingsModal.style.display = 'block'; // モーダルを表示
    }
  }

  closeSettings() {
    const settingsModal = document.getElementById('settings-modal');
    if (settingsModal) {
      settingsModal.style.display = 'none'; // モーダルを非表示
    }
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
