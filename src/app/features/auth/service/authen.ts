import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ILogin, Iotp, IresetPass, Iverify } from '../models/iauth';
import { environment } from '../../../../env/environment';

@Injectable({
  providedIn: 'root',
})
export class Authen {
  private TokenKey = 'token';
  private email!: string;
  constructor(
    private http: HttpClient,
    private Router: Router,
  ) {}
  login(data: any): Observable<any> {
    return this.http.post<any>(environment.url + 'auth/login', data);
  }
  emailVerify(data: Iverify | any): Observable<string> {
    return this.http.post(environment.url + 'auth/password/forget', data, { responseType: 'text' });
  }
  resendOtp(email: string) {
    return this.emailVerify({ email });
  }

  sendOtp(data: Iotp | any): Observable<string> {
    return this.http.post(environment.url + 'auth/password/validate-otp', data, {
      responseType: 'text',
    });
  }
  resetPassword(data: IresetPass | any): Observable<string> {
    return this.http.post(environment.url + 'auth/password/reset', data, {
      responseType: 'text',
    });
  }
  setToken(token: string) {
    localStorage.setItem(this.TokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TokenKey);
  }

  setEmail(email: string) {
    this.email = email;
  }

  getEmail() {
    return this.email;
  }
  logout() {
    localStorage.removeItem(this.TokenKey);
    this.Router.navigate(['/login']);
  }
}
