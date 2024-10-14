import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // HttpClientのインポートを追加
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common'; // DOCUMENTのインポートを追加
import { Inject } from '@angular/core';

@Component({
  selector: 'app-join',
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.css'],
})

export class JoinComponent {
  sessionContainer: any;
  authEndpoint = 'https://spiral-agent.com/api/createMeeting';
  csrfCookieEndpoint = 'https://spiral-agent.com/api/sanctum/csrf-cookie';  // CSRFトークン取得エンドポイント
  inSession: boolean = false;
  config = {
    videoSDKJWT: '',
    sessionName: '',
    userName: '',
    sessionPasscode: '123',
  };
  role = 1;

  constructor(public httpClient: HttpClient, @Inject(DOCUMENT) private document: Document, private router: Router) {}

  ngOnInit() {
    this.checkScreenSharingSupport();
  }

  // スクリーンシェアサポート確認
  checkScreenSharingSupport() {
    if ('getDisplayMedia' in navigator.mediaDevices) {
      console.log('Screen sharing is supported in this browser.');
    } else {
      console.error('Screen sharing is not supported in this browser.');
    }
  }

  getCookie(name: string): string | null {
    const matches = document.cookie.match(new RegExp(
      '(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'
    ));
    return matches ? decodeURIComponent(matches[1]) : null;
  }

  getCsrfToken() {
    return this.httpClient.get(this.csrfCookieEndpoint, { withCredentials: true, responseType: 'text' });
  }


  joinSession() {
    this.sessionContainer = this.document.getElementById('sessionContainer');
    this.inSession = true;

    // CSRFトークンを取得してからAPIリクエストを送る
    this.getCsrfToken().subscribe({
      next: () => {
        const xsrfToken = this.getCookie('XSRF-TOKEN');  // XSRF-TOKENをクッキーから取得

        if (xsrfToken) {
          // CSRFトークン取得後に署名を取得
          this.httpClient.post(this.authEndpoint, {
            role: this.role,
          }, {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
              'X-XSRF-TOKEN': xsrfToken  // ヘッダーにXSRF-TOKENを設定
            }
          }).subscribe({
            next: (data: any) => {
              if (data.signature) {
                console.log(data.signature);
                this.config.videoSDKJWT = data.signature;
                this.config.sessionName = data.sessionName;
                this.config.userName = data.userName;
                this.router.navigate(['/session', {
                  jwt: this.config.videoSDKJWT,
                  name: this.config.userName,
                  sessionName: this.config.sessionName
                }]);

              } else {
                console.error('Invalid response', data);
              }
            },
            error: (error: any) => {
              console.error('Error fetching JWT', error);
            }
          });
        } else {
          console.error('CSRF token not found in cookies');
        }
      },
      error: (error) => {
        console.error('Error fetching CSRF token', error);
      }
    });
  }

  /*joinSession() {
    // JWTトークンを取得するロジックをここに実装
    this.getVideoSDKJWT()
    // JWTが取得できたらセッション画面に遷移
    this.router.navigate(['/session', { config: this.config}]);
  }*/
}
