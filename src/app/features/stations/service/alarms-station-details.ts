import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import * as signalR from '@microsoft/signalr';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../../env/environment';
@Injectable({
  providedIn: 'root',
})
export class AlarmsStationDetails {
  private http = inject(HttpClient);
  private hubConnection!: signalR.HubConnection;
  private alarmsSubject = new BehaviorSubject<any>(null);
  public alarms$ = this.alarmsSubject.asObservable();
  private connectionStarted = false;

  async startConnection(): Promise<void> {
    if (this.connectionStarted) return;
    this.connectionStarted = true;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://10.11.140.37/Taqa_2026_RealTime/hubs/stationAlarms')
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.hubConnection.on('ReceiveAlarm', (data) => {
      this.alarmsSubject.next(data);
    });

    try {
      await this.hubConnection.start();
      console.log('SignalR Alarms Connected');
    } catch (err) {
      console.log('Error while starting Alarms connection: ' + err);
      this.connectionStarted = false;
    }
  }

  joinStation(stationId: number): Promise<void> {
    if (!this.hubConnection) {
      return Promise.reject('No active connection');
    }

    // Clear previous data
    this.alarmsSubject.next(null);

    return this.hubConnection
      .invoke('JoinStation', stationId)
      .then(() => console.log(`Joined station group Alarm ${stationId}`))
      .catch((err) => console.error('Error joining station group:', err));
  }

  getStationDetails(): Observable<any> {
    return this.alarms$;
  }

  leaveStation(stationId: number): Promise<void> {
    if (!this.hubConnection) return Promise.resolve();
    return this.hubConnection
      .invoke('LeaveStation', stationId)
      .then(() => console.log(`Left station group Alarm ${stationId}`))
      .catch((err) => console.error(err));
  }

  stopConnection() {
    if (this.hubConnection) {
      this.hubConnection
        .stop()
        .then(() => console.log('SignalR connection stopped'))
        .catch((err) => console.log('Error while stopping SignalR connection: ', err));
    }
  }

  getAlarmsHistory(stationId: number): Observable<any> {
    return this.http.get(`${environment.url}Alarms/history`, {
      params: { stationId },
    });
  }
}
