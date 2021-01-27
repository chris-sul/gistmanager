import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { OktaAuthService } from '@okta/okta-angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})


export class HomeComponent implements OnInit {
  userName: string = "";
  isAuthenticated: boolean = false;
  url:string = "http://localhost:8000/users/";

  constructor(public oktaAuth: OktaAuthService, private http: HttpClient) {
    // Subscribe to authentication state changes
    this.oktaAuth.$authenticationState.subscribe(
      (isAuthenticated: boolean) => this.isAuthenticated = isAuthenticated
    );
  }

  async ngOnInit() {
    console.log("here");
    this.isAuthenticated = await this.oktaAuth.isAuthenticated();

    // returns an object with user's claims
    const userClaims = await this.oktaAuth.getUser();

    // user name is exposed directly as property
    this.userName = userClaims.name as string;

    const accessToken = this.oktaAuth.getAccessToken();
    this.http.get(this.url, {
      headers: {
        Authorization: 'Bearer ' + accessToken,
      }
    }).subscribe((data: any) => {
      // Use the data returned by the API
      console.log(data);

    }, (err) => {
      console.error(err);
    });
  }

}
