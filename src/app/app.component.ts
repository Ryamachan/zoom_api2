import { Component, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';

import uitoolkit from "@zoom/videosdk-ui-toolkit";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  sessionContainer: any;
  authEndpoint = 'http://57.180.42.187/api/createMeeting'
  inSession: boolean = false
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
  role = 1

  constructor(public httpClient: HttpClient, @Inject(DOCUMENT) document: any) {

  }

  ngOnInit() {

  }

  getVideoSDKJWT() {
    console.log("work")
    this.sessionContainer = document.getElementById('sessionContainer')

    this.inSession = true

    this.httpClient.post(this.authEndpoint, {
	    sessionName:  this.config.sessionName,
      role: this.role,
    }).subscribe((data: any) => {
      if(data.signature) {
        console.log(data.signature)
        this.config.videoSDKJWT = data.signature
        this.joinSession()
      } else {
        console.log(data)
      }
    })
  }

  joinSession() {
    uitoolkit.joinSession(this.sessionContainer, this.config)

//    uitoolkit.onSessionClosed(this.sessionClosed)
  }

  sessionClosed = (() => {
    console.log('session closed')
    uitoolkit.closeSession(this.sessionContainer)
    this.inSession = false
  })
}
