import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EmailVerify } from '../email-verify/email-verify';
import { Authen } from '../../service/authen';
import { ILogin } from '../../models/iauth';
import { Router } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  ɵInternalFormsSharedModule,
} from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { inject } from '@angular/core/primitives/di';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login',
  imports: [RouterLink, EmailVerify, ɵInternalFormsSharedModule, ReactiveFormsModule, ToastModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  constructor(
    private _Authen: Authen,

    private Router: Router,
    private messageService: MessageService,
  ) {}
  ngOnInit(): void {}
  showPassword = false;
  togglePassword() {
    this.showPassword = !this.showPassword;
  }
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });
  showSuccess() {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Message Content',
      life: 2000,
    });
  }
  showError() {
    this.messageService.add({
      severity: 'error',
      summary: 'Error Login',
      detail: 'Message Content',
      life: 2000,
    });
  }
  isLoading = false;
  Login() {
    if (this.isLoading) return;
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this._Authen.login(this.loginForm.value).subscribe({
      next: (res) => {
        console.log(res);
        this._Authen.setToken(res.token, res.roles);
        this.showSuccess();

        this.Router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.log(err);
        this.isLoading = false;
        this.showError();
      },
    });
  }
}
