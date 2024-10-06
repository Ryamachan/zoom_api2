import { Component, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';

import uitoolkit from "@zoom/videosdk-ui-toolkit";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  sessionContainer: any;
  authEndpoint = 'http://43.207.165.252/api/createMeeting';
  csrfCookieEndpoint = 'http://43.207.165.252/api/sanctum/csrf-cookie';  // CSRFトークン取得エンドポイント
  inSession: boolean = false;
  config = {
    videoSDKJWT: '',
    sessionName: 'test',
    userName: 'Angular',
    sessionPasscode: '123',
    features: ['preview', 'video', 'audio', 'settings', 'users', 'chat', 'share'],
    options: { init: {}, audio: {}, video: {}, share: {}},
    virtualBackground: {
       allowVirtualBackground: true,
       allowVirtualBackgroundUpload: true,
    }
  };
  role = 1;

  constructor(public httpClient: HttpClient, @Inject(DOCUMENT) private document: Document) {}

  ngOnInit() {}

  // CSRFトークンを取得する関数
  /*
  getCsrfToken() {
    return this.httpClient.get(this.csrfCookieEndpoint, { withCredentials: true });
  }*/

  getCsrfToken() {
    return this.httpClient.get(this.csrfCookieEndpoint, { withCredentials: true, responseType: 'text' });
  }

  // JWT署名を取得してZoomセッションに参加する関数
  getVideoSDKJWT() {
    this.sessionContainer = this.document.getElementById('sessionContainer');
    this.inSession = true;

    // CSRFトークンを取得してからAPIリクエストを送る
    this.getCsrfToken().subscribe({
      next: () => {
        // CSRFトークン取得後に署名を取得
        this.httpClient.post(this.authEndpoint, {
          sessionName: this.config.sessionName,
          role: this.role,
          userName: this.config.userName
        }, { withCredentials: true,headers: { 'Content-Type': 'application/json' } }).subscribe({
          next: (data: any) => {
            if (data.signature) {
              console.log(data.signature);
              this.config.videoSDKJWT = data.signature;
              this.joinSession();
            } else {
              console.error('Invalid response', data);
            }
          },
          error: (error: any) => {
            console.error('Error fetching JWT', error);
          }
        });
      },
      error: (error) => {
        console.error('Error fetching CSRF token', error);
      }
    });
  }

  joinSession() {
    uitoolkit.joinSession(this.sessionContainer, this.config);
  }

  sessionClosed = () => {
    console.log('session closed');
    uitoolkit.closeSession(this.sessionContainer);
    this.inSession = false;
  };
}
