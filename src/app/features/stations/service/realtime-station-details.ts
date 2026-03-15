import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root',
})
export class RealtimeStationDetails {
  private hubConnection!: signalR.HubConnection;

  startConnection(): Promise<void> {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://10.11.140.37/Taqa_Back_2026/hubs/station-kpis')
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
      .invoke('JoinStationGroup', stationId)
      .then(() => console.log(`Joined station group ${stationId}`))
      .catch((err) => console.error('Error joining station group:', err));
  }

  getStationDetails(): Observable<any> {
    return new Observable((subscriber) => {
      if (!this.hubConnection) {
        subscriber.error('No active connection');
        return;
      }

      this.hubConnection.on('ReceiveStationKpis', (data) => {
        subscriber.next(data);
      });

      return () => {
        this.hubConnection.off('ReceiveStationKpis');
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
}
