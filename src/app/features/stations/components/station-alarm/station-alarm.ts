import { Component, OnDestroy, OnInit } from '@angular/core';
import { RealtimeAlarmsDashboard } from '../../../dashboard/service/realtime-alarms-dashboard';

@Component({
  selector: 'app-station-alarm',
  imports: [],
  templateUrl: './station-alarm.html',
  styleUrl: './station-alarm.scss',
})
export class StationAlarm implements OnInit, OnDestroy {
  alarms: any[] = [];
  isLoading: boolean = true;
  constructor(private realTime: RealtimeAlarmsDashboard) {}
  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    // this.onStartConnection();
  }
  async onStartConnection() {
    await this.realTime.startConnection();
    this.realTime.showAlarms((data) => {
      console.log('Received alarm data:', data);
      this.isLoading = false;
      this.alarms.unshift(data);
    });
  }
  ngOnDestroy(): void {
    this.realTime.stopConnection();
  }
}
