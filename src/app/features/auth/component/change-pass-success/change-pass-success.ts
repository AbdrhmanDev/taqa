import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-pass-success',
  imports: [],
  templateUrl: './change-pass-success.html',
  styleUrl: './change-pass-success.scss',
})
export class ChangePassSuccess implements OnInit {
  constructor(private router: Router) {}
  ngOnInit(): void {}
  goToHome() {
    this.router.navigate(['/login']);
  }
}
