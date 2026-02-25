import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
@Injectable({
  providedIn: 'root',
})
export class RealtimeAlarmsDashboard {
  private hubConnection!: signalR.HubConnection;
  startConnection(): Promise<void> {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://10.11.140.37/Taqa_2026_RealTime/hubs/alarms')
      .withAutomaticReconnect()
      .build();

    return this.hubConnection
      .start()
      .then(() => console.log('SignalR Connected'))
      .catch((err) => console.log('Error while starting connection: ' + err));
  }

  showAlarms(callback: (data: any) => void) {
    this.hubConnection.on('ReceiveAlarm', (data) => {
      callback(data);
    });
  }
  public stopConnection() {
    if (this.hubConnection) {
      this.hubConnection
        .stop()
        .then(() => console.log(' SignalR connection stopped'))
        .catch((err) => console.log(' Error while stopping SignalR connection: ', err));
    }
  }
}
