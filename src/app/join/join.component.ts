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
      this.router.navigate(['/session']);
  };
}
