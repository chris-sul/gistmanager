import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { OktaCallbackComponent } from '@okta/okta-angular';

import { HomeComponent } from './home/home.component';
import { SettingsComponent } from './settings/settings.component';

const CALLBACK_PATH = 'login/callback'


const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'settings', component: SettingsComponent },
  { path: CALLBACK_PATH, component: OktaCallbackComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
