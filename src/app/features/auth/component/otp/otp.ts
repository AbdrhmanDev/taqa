import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { InputOtpModule } from 'primeng/inputotp';

import {
  FormControl,
  FormGroup,
  FormsModule,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Authen } from '../../service/authen';
import { MessageService } from 'primeng/api';
@Component({
  selector: 'app-otp',
  imports: [InputOtpModule, FormsModule, ReactiveFormsModule],
  templateUrl: './otp.html',
  styleUrl: './otp.scss',
})
export class Otp implements OnInit {
  value: string = '';

  constructor(
    private _Authen: Authen,
    private Router: Router,
    private messageService: MessageService,
  ) {}
  ngOnInit(): void {
    const email = this._Authen.getEmail();
    if (email) {
      this.otpForm.patchValue({
        email: email,
      });
    }
  }
  otpForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    otp: new FormControl('', [Validators.required]),
  });
  onSendOtp() {
    this._Authen.sendOtp(this.otpForm.value).subscribe({
      next: (res) => {
        console.log(res);
        this.showSuccess();
        this.Router.navigate(['/reset-password']);
      },
      error: (err) => {
        console.log(err);
        this.showError();
      },
    });
  }
  showSuccess() {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Correct OTP',
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
  onResendOtp() {
    const email = this.otpForm.value.email;

    if (!email) {
      return;
    }

    this._Authen.resendOtp(email).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'OTP resent to your email',
          life: 2000,
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to resend OTP',
          life: 2000,
        });
      },
    });
  }
}
