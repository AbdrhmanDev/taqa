import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export interface TestDiagnostic {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  latency?: number;
  errorType?: string;
  errorMessage?: string;
  lastPacketTime?: Date;
  packetCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class SignalrTestService {
  // URLs from production config
  private readonly URLS = {
    KPI: 'http://10.11.140.37/Taqa_Back_2026/hubs/station-kpis',
    DISPENSER: 'http://10.11.140.37/Taqa_Back_2026/hubs/dispensers',
    COMPRESSOR: 'http://10.11.140.37/Taqa_Back_2026/monitoringHub'
  };

  constructor() {}

  /**
   * Creates a high-performance isolated SignalR connection
   * @param hubType The type of hub to connect to
   */
  createConnection(hubType: 'KPI' | 'DISPENSER' | 'COMPRESSOR'): signalR.HubConnection {
    return new signalR.HubConnectionBuilder()
      .withUrl(this.URLS[hubType], {
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
        skipNegotiation: false // Setting to false for compatibility, can be true if WebSockets only
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: retryContext => {
          if (retryContext.elapsedMilliseconds < 60000) return 2000;
          return 10000;
        }
      })
      .configureLogging(signalR.LogLevel.Debug) // Maximum logging for diagnostics
      .build();
  }

  /**
   * Helper to measure connection performance
   */
  async measureConnection(connection: signalR.HubConnection): Promise<number> {
    const start = performance.now();
    await connection.start();
    const end = performance.now();
    return Math.round(end - start);
  }
}
