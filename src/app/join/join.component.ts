import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-join',
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.css'],
})
export class JoinComponent {
  constructor(private router: Router) {}

  getVideoSDKJWT() {
    // JWTトークンを取得するロジックをここに実装
    // JWTが取得できたらセッション画面に遷移
    this.router.navigate(['/session']);
  }
}
