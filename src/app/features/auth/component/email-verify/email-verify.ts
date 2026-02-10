import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Authen } from '../../service/authen';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';

import { ReactiveFormsModule } from '@angular/forms';
@Component({
  selector: 'app-email-verify',
  imports: [ReactiveFormsModule],
  templateUrl: './email-verify.html',
  styleUrl: './email-verify.scss',
})
export class EmailVerify implements OnInit {
  constructor(
    private _Authen: Authen,
    private _Router: Router,
    private messageService: MessageService,
  ) {}
  ngOnInit(): void {}
  forgetPassForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });
  onForgetPass() {
    const email: any = this.forgetPassForm.value.email;
    this._Authen.emailVerify(this.forgetPassForm.value).subscribe({
      next: (res) => {
        console.log(res);
        this._Authen.setEmail(email);
        this.showSuccess();
        this._Router.navigate(['/otp']);
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
      detail: 'OTP Sent cheack your email',
      life: 2000,
    });
  }
  showError() {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to sent OTP',
      life: 2000,
    });
  }
}
