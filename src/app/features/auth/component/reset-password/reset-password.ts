import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Authen } from '../../service/authen';
import { MessageService } from 'primeng/api';
import { ReactiveFormsModule } from '@angular/forms';
@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPassword implements OnInit {
  constructor(
    private _Authen: Authen,
    private Router: Router,
    private messageService: MessageService,
  ) {}
  ngOnInit(): void {}
  resetPassForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    newPassword: new FormControl('', [Validators.required]),
  });
  onResetPassword() {
    this._Authen.resetPassword(this.resetPassForm.value).subscribe({
      next: (res) => {
        console.log(res);
        this.showSuccess();
        this.Router.navigate(['/change-pass-success']);
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
      detail: 'Change Password is Success',
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
}
