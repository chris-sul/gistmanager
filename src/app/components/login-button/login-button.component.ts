import { Component, OnInit } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';

import { faUserCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-login-button',
  templateUrl: './login-button.component.html',
  styles: [],
})
export class LoginButtonComponent implements OnInit {
  faUserCircle = faUserCircle;

  constructor(public auth: AuthService) {}

  ngOnInit(): void {}

  loginWithRedirect(): void {
    this.auth.loginWithRedirect();
  }
}