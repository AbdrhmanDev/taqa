import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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
  startConnection(): Promise<void> {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://10.11.140.37/Taqa_2026_RealTime/hubs/stationAlarms')
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    return this.hubConnection
      .start()
      .then(() => console.log('SignalR Connected'))
      .catch((err) => console.log('Error while starting connection: ' + err));
  }

  joinStation(stationId: number): Promise<void> {
    if (!this.hubConnection) {
      return Promise.reject('No active connection');
    }

    return this.hubConnection
      .invoke('JoinStation', stationId)
      .then(() => console.log(`Joined station group Alarm ${stationId}`))
      .catch((err) => console.error('Error joining station group:', err));
  }

  getStationDetails(): Observable<any> {
    return new Observable((subscriber) => {
      if (!this.hubConnection) {
        subscriber.error('No active connection');
        return;
      }

      this.hubConnection.on('ReceiveAlarm', (data) => {
        subscriber.next(data);
      });

      return () => {
        this.hubConnection.off('ReceiveAlarm');
      };
    });
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
