import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.css'],
})
export class SessionComponent implements OnInit {
  ngOnInit() {
    this.startVideoSession();
  }

  startVideoSession() {
    // Zoom Video SDKの初期化とビデオの表示処理をここに実装
  }
}
