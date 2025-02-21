import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { WebSocketSubject } from 'rxjs/webSocket';

@Injectable({
  providedIn: 'root'
})
export class VideoService {
  private csrfCookieEndpoint = 'https://spiral-agent.com/api/sanctum/csrf-cookie'; // CSRFトークン取得エンドポイント
  private processVideoEndpoint = 'https://spiral-agent.com/api/process-frame'; // ビデオ処理エンドポイント
  private socket: WebSocketSubject<any>;

  constructor(private httpClient: HttpClient) {
      this.socket = new WebSocketSubject('wss://spiral-agent.com:8080/socket/process-frame'); // WebSocket接続
  }

  getCsrfToken(): Observable<any> {
    return this.httpClient.get(this.csrfCookieEndpoint, { withCredentials: true }).pipe(
      tap(() => {
        // CSRFトークンを取得した後にクッキーの確認
        console.log('CSRF Token received and cookie set');
      })
    );
  }

  getCookie(name: string): string | null {
    const matches = document.cookie.match(new RegExp(
      `(?:^|; )${name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1')}=([^;]*)`
    ));
    console.log('Document cookie:', document.cookie); // クッキーがどう設定されているか確認
    return matches ? decodeURIComponent(matches[1]) : null;
  }

  sendFrame(frameData: Blob) {
    console.log("Sending frame to server:", frameData);  // サーバーへの送信内容を確認
    this.socket.next(frameData);  // フレームデータを送信
  }

  receiveFrame() {
    console.log("Receiving frame data from WebSocket...");
    return this.socket.asObservable();  // WebSocketから受け取る
  }
}
