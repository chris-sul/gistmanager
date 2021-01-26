import { Component } from '@angular/core';

import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  constructor(public auth: AuthService) {}

  title = 'gistmanager';
  faUserCircle = faUserCircle;
}
