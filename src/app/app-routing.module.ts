import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JoinComponent } from './join/join.component';
import { SessionComponent } from './session/session.component';

const routes: Routes = [
  { path: '', component: JoinComponent }, // 初期画面
  { path: 'session', component: SessionComponent }, // セッション画面
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
