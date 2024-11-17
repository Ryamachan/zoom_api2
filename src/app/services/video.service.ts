import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class VideoService {
  private csrfCookieEndpoint = 'https://d39pgh50coc0c9.cloudfront.net/api/sanctum/csrf-cookie'; // CSRFトークン取得エンドポイント
  private processVideoEndpoint = 'https://d39pgh50coc0c9.cloudfront.net/api/process-video'; // ビデオ処理エンドポイント

  constructor(private httpClient: HttpClient) {}

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

  processVideoFrame(frameData: Blob): Observable<any> {
    const formData = new FormData();
    formData.append('frame', frameData, 'frame.jpg');

    return this.getCsrfToken().pipe(
      switchMap(() => {
        // CSRFトークンを取得した後にクッキーからトークンを取得
        const xsrfToken = this.getCookie('XSRF-TOKEN');
        console.log('XSRF-TOKEN:', xsrfToken); // クッキーから取得したトークンを確認
        if (!xsrfToken) {
          console.error('XSRF-TOKEN is not found');
        }
        return this.httpClient.post(this.processVideoEndpoint, formData, {
          withCredentials: true,
          headers: {
            'X-XSRF-TOKEN': xsrfToken || '' // ヘッダーにCSRFトークンを設定
          }
        });
      })
    );
  }
}
