import { Component } from '@angular/core';

import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { OktaAuthService } from '@okta/okta-angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  isAuthenticated: boolean = false;

  title = 'gistmanager';
  faUserCircle = faUserCircle;


  constructor(public oktaAuth: OktaAuthService) {
    // Subscribe to authentication state changes
    this.oktaAuth.$authenticationState.subscribe(
      (isAuthenticated: boolean) => this.isAuthenticated = isAuthenticated
    );
  }

  async ngOnInit() {
    this.isAuthenticated = await this.oktaAuth.isAuthenticated();
  }

  login() {
    this.oktaAuth.signInWithRedirect();
  }

  
  logout() {
    this.oktaAuth.signOut();
  }
}
