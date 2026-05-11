import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root',
})
export class RealtimeStationDetails {
  private stationKpisConnection!: signalR.HubConnection;
  private dispenserConnection!: signalR.HubConnection;
  private compressorConnection!: signalR.HubConnection;

  // Subjects for persistent state
  private stationKpisSubject = new BehaviorSubject<any>(null);
  public stationKpis$ = this.stationKpisSubject.asObservable();

  private dispenserSubject = new BehaviorSubject<any>(null);
  public dispenser$ = this.dispenserSubject.asObservable();

  private compressorSubject = new BehaviorSubject<any>(null);
  public compressor$ = this.compressorSubject.asObservable();

  // Connection state management
  private kpisStarted = false;
  private dispenserStarted = false;
  private compressorStarted = false;

  // ============ Station KPIs ============
  async startConnection(): Promise<void> {
    if (this.kpisStarted) return;
    this.kpisStarted = true;

    this.stationKpisConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://10.11.140.37/Taqa_Back_2026/hubs/station-kpis', {
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
        skipNegotiation: false
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: retryContext => {
          if (retryContext.elapsedMilliseconds < 60000) return 2000;
          return 10000;
        }
      })
      .build();

    this.stationKpisConnection.on('ReceiveStationKpis', (data) => {
      console.log('📡 [SignalR] Raw KPI Data Received:', data);
      this.stationKpisSubject.next(data);
    });

    try {
      await this.stationKpisConnection.start();
      console.log('✅ Station KPIs Connected');
    } catch (err) {
      console.error('❌ Station KPIs Connection Error:', err);
      this.kpisStarted = false;
    }
  }

  joinStation(stationId: number): Promise<void> {
    if (!this.stationKpisConnection) return Promise.resolve();
    // Clear previous data to prevent stale data flicker
    this.stationKpisSubject.next(null);
    return this.stationKpisConnection
      .invoke('JoinStationGroup', stationId)
      .then(() => console.log(`Joined station group ${stationId}`))
      .catch((err) => console.error(err));
  }

  getStationDetails(): Observable<any> {
    return this.stationKpis$;
  }

  leaveStation(stationId: number): Promise<void> {
    if (!this.stationKpisConnection) return Promise.resolve();
    return this.stationKpisConnection
      .invoke('LeaveStationGroup', stationId)
      .then(() => console.log(`Left station group ${stationId}`))
      .catch((err) => console.error(err));
  }

  async stopConnection(): Promise<void> {
    this.kpisStarted = false;
    if (this.stationKpisConnection) {
      await this.stationKpisConnection.stop();
      console.log('🛑 Station KPIs Connection Stopped');
    }
  }

  // ============ Dispenser ============
  async startConnectionDispenser(): Promise<void> {
    if (this.dispenserStarted) return;
    this.dispenserStarted = true;

    this.dispenserConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://10.11.140.37/Taqa_Back_2026/hubs/dispensers', {
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
        skipNegotiation: false
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: retryContext => {
          if (retryContext.elapsedMilliseconds < 60000) return 2000;
          return 10000;
        }
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.dispenserConnection.on('ReceiveStationDispensers', (data) => {
      console.log('📡 [SignalR] Raw Dispenser Data Received:', data);
      this.dispenserSubject.next(data);
    });

    try {
      await this.dispenserConnection.start();
      console.log('Dispenser Connected');
    } catch (err) {
      console.error('Dispenser Connection Error:', err);
      this.dispenserStarted = false;
    }
  }

  joinDispenser(stationId: number): Promise<void> {
    if (!this.dispenserConnection) return Promise.resolve();
    // Clear previous data
    this.dispenserSubject.next(null);
    return this.dispenserConnection
      .invoke('JoinStationGroup', stationId)
      .then(() => console.log(`Joined dispenser group ${stationId}`))
      .catch((err) => console.error(err));
  }

  getDispenserDetails(): Observable<any> {
    return this.dispenser$;
  }

  leaveDispenser(stationId: number): Promise<void> {
    if (!this.dispenserConnection) return Promise.resolve();
    return this.dispenserConnection
      .invoke('LeaveStationGroup', stationId)
      .then(() => console.log(`Left dispenser group ${stationId}`))
      .catch((err) => console.error(err));
  }

  async stopConnectionDispenser(): Promise<void> {
    this.dispenserStarted = false;
    if (this.dispenserConnection) {
      await this.dispenserConnection.stop();
      console.log('🛑 Dispenser Connection Stopped');
    }
  }

  // ============ Compressor ============
  async startConnectionCompressor(): Promise<void> {
    if (this.compressorStarted) return;
    this.compressorStarted = true;

    this.compressorConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://10.11.140.37/Taqa_Back_2026/monitoringHub', {
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
        skipNegotiation: false
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: retryContext => {
          if (retryContext.elapsedMilliseconds < 60000) return 2000;
          return 10000;
        }
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.compressorConnection.on('ReceiveDashboard', (data) => {
      console.log('📡 [SignalR] Raw Compressor Data Received:', data);
      this.compressorSubject.next(data);
    });

    try {
      await this.compressorConnection.start();
      console.log('Compressor Connected ');
    } catch (err) {
      console.error('Compressor Connection Error:', err);
      this.compressorStarted = false;
    }
  }

  joinCompressor(stationId: number): Promise<void> {
    if (!this.compressorConnection) return Promise.resolve();
    // Clear previous data
    this.compressorSubject.next(null);
    return this.compressorConnection
      .invoke('JoinStation', stationId)
      .then(() => console.log(`Joined compressor station_${stationId} `))
      .catch((err) => console.error(err));
  }

  getCompressorDetails(): Observable<any> {
    return this.compressor$;
  }

  leaveCompressor(stationId: number): Promise<void> {
    if (!this.compressorConnection) return Promise.resolve();
    return this.compressorConnection
      .invoke('LeaveStation', stationId)
      .then(() => console.log(`Left compressor station_${stationId}`))
      .catch((err) => console.error(err));
  }

  async stopConnectionCompressor(): Promise<void> {
    this.compressorStarted = false;
    if (this.compressorConnection) {
      await this.compressorConnection.stop();
      console.log('🛑 Compressor Connection Stopped');
    }
  }

  async stopAllConnections(): Promise<void> {
    console.log('🧹 [Cleanup] Stopping all SignalR connections...');
    await Promise.allSettled([
      this.stopConnection(),
      this.stopConnectionDispenser(),
      this.stopConnectionCompressor()
    ]);
    console.log('✅ [Cleanup] All connections shut down.');
  }
}
