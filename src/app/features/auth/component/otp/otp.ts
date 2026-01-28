import { Component } from '@angular/core';
import { InputOtpModule } from 'primeng/inputotp';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-otp',
  imports: [InputOtpModule, FormsModule],
  templateUrl: './otp.html',
  styleUrl: './otp.scss',
})
export class Otp {
  value: string = '';
}
