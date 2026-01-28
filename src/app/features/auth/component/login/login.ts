import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EmailVerify } from '../email-verify/email-verify';

@Component({
  selector: 'app-login',
  imports: [RouterLink, EmailVerify],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {}
