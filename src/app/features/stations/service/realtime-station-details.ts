import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root',
})
export class RealtimeStationDetails {
  private stationKpisConnection!: signalR.HubConnection;
  private dispenserConnection!: signalR.HubConnection;
  private compressorConnection!: signalR.HubConnection;

  // ============ Station KPIs ============
  startConnection(): Promise<void> {
    this.stationKpisConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://10.11.140.37/Taqa_Back_2026/hubs/station-kpis')
      .withAutomaticReconnect()
      .build();

    this.stationKpisConnection.onclose(() => {
      console.log('❌ Connection Closed');
    });

    this.stationKpisConnection.onreconnecting(() => {
      console.log('⏳ Reconnecting...');
    });

    this.stationKpisConnection.onreconnected(() => {
      console.log('✅ Reconnected');
    });

    return this.stationKpisConnection
      .start()
      .then(() => {
        console.log('✅ Station KPIs Connected');
        console.log('State:', this.stationKpisConnection.state);
      })
      .catch((err) => console.log('❌ Error: ' + err));
  }

  joinStation(stationId: number): Promise<void> {
    return this.stationKpisConnection
      .invoke('JoinStationGroup', stationId)
      .then(() => console.log(`Joined station group ${stationId}`))
      .catch((err) => console.error(err));
  }

  getStationDetails(): Observable<any> {
    return new Observable((subscriber) => {
      console.log('👂 Listening to ReceiveStationKpis...');

      let received = false;

      this.stationKpisConnection.on('ReceiveStationKpis', (data) => {
        received = true;
        console.log('🔥 Data Received:', data);
        subscriber.next(data);
      });

      // check لو مفيش داتا
      setTimeout(() => {
        if (!received) {
          console.warn('⚠️ Connected but no data received from server');
        }
      }, 5000);

      return () => this.stationKpisConnection.off('ReceiveStationKpis');
    });
  }

  stopConnection() {
    this.stationKpisConnection?.stop();
  }

  // ============ Dispenser ============
  startConnectionDispenser(): Promise<void> {
    this.dispenserConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://10.11.140.37/Taqa_Back_2026/hubs/dispensers')
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    return this.dispenserConnection
      .start()
      .then(() => console.log('Dispenser Connected'))
      .catch((err) => console.error('Error: ' + err));
  }

  joinDispenser(stationId: number): Promise<void> {
    return this.dispenserConnection
      .invoke('JoinStationGroup', stationId)
      .then(() => console.log(`Joined dispenser group ${stationId}`))
      .catch((err) => console.error(err));
  }

  getDispenserDetails(): Observable<any> {
    return new Observable((subscriber) => {
      this.dispenserConnection.on('ReceiveStationDispensers', (data) => {
        subscriber.next(data);
      });
      return () => this.dispenserConnection.off('ReceiveStationDispensers');
    });
  }

  stopConnectionDispenser(): Promise<void> {
    return this.dispenserConnection?.stop();
  }

  // ============ Compressor ============
  startConnectionCompressor(): Promise<void> {
    this.compressorConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://10.11.140.37/Taqa_Back_2026/monitoringHub')
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    return this.compressorConnection
      .start()
      .then(() => console.log('Compressor Connected '))
      .catch((err) => console.log('Error: ' + err));
  }

  joinCompressor(stationId: number): Promise<void> {
    return this.compressorConnection
      .invoke('JoinStation', stationId)
      .then(() => console.log(`Joined compressor station_${stationId} `))
      .catch((err) => console.error(err));
  }

  getCompressorDetails(): Observable<any> {
    return new Observable((subscriber) => {
      this.compressorConnection.on('ReceiveDashboard', (data) => {
        subscriber.next(data);
      });
      return () => this.compressorConnection.off('ReceiveDashboard');
    });
  }

  stopConnectionCompressor(): Promise<void> {
    return this.compressorConnection?.stop();
  }
}
