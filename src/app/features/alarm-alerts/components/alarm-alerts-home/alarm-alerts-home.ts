import { Component, OnInit } from '@angular/core';
import { SelectModule } from 'primeng/select';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alarm-alerts-home',
  imports: [SelectModule, CommonModule],
  templateUrl: './alarm-alerts-home.html',
  styleUrl: './alarm-alerts-home.scss',
})
export class AlarmAlertsHome implements OnInit {
  constructor(private router: Router) {}
  ngOnInit(): void {}
  goViewAlarmDetails() {
    this.router.navigate(['dashboard/alarm-view']);
  }
  createAlarm() {
    this.router.navigate(['dashboard/alarm-add']);
  }
}
