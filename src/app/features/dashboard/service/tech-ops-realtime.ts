import { Observable, BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
@Injectable({
  providedIn: 'root',
})
export class TechOpsRealtime {
  private hubConnection!: signalR.HubConnection;
  private techOpsDataSubject = new BehaviorSubject<any[]>([]);
  public techOpsData$ = this.techOpsDataSubject.asObservable();
  private connectionStarted = false;

  async startConnection(): Promise<void> {
    if (this.connectionStarted) return;
    this.connectionStarted = true;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://10.11.140.37/Taqa_2026_RealTime/hubs/station')
      .withAutomaticReconnect()
      .build();

    try {
      await this.hubConnection.start();
      console.log('SignalR TechOps Connected');
      
      this.hubConnection.on('ReceiveStation', (data) => {
        this.techOpsDataSubject.next(data);
      });
    } catch (err) {
      console.log('Error while starting connection: ' + err);
      this.connectionStarted = false;
    }
  }

  getTechOps(): Observable<any[]> {
    return this.techOpsData$;
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
