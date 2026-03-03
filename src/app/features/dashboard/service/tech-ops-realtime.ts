import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
@Injectable({
  providedIn: 'root',
})
export class TechOpsRealtime {
  private hubConnection!: signalR.HubConnection;

  startConnection(): Promise<void> {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://10.11.140.37/Taqa_2026_RealTime/hubs/station')
      .withAutomaticReconnect()
      .build();

    return this.hubConnection
      .start()
      .then(() => console.log('SignalR Connected'))
      .catch((err) => console.log('Error while starting connection: ' + err));
  }

  getTechOps(): Observable<any[]> {
    return new Observable((subscriber) => {
      this.hubConnection.on('ReceiveStation', (data) => {
        subscriber.next(data);
      });
      return () => {
        this.hubConnection.off('ReceiveStation');
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
