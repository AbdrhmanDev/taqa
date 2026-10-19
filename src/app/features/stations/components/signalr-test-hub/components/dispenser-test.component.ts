import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SignalrTestService, TestDiagnostic } from '../service/signalr-test.service';
import * as signalR from '@microsoft/signalr';

@Component({
  selector: 'app-dispenser-test',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dispenser-test.component.html',
  styleUrls: ['./dispenser-test.component.css']
})
export class DispenserTestComponent implements OnDestroy {
  stationId: number = 1;
  diagnostic: TestDiagnostic = { status: 'disconnected', packetCount: 0 };
  receivedData: any = null;
  flashActive: boolean = false;
  lastIntervalMs: number | null = null;
  averageIntervalMs: number | null = null;
  minIntervalMs: number | null = null;
  maxIntervalMs: number | null = null;
  intervalHistory: Array<{ packet: number; receivedAt: Date; intervalMs: number }> = [];
  
  private connection: signalR.HubConnection | null = null;
  private startTime: number = 0;
  private previousPacketTime: number | null = null;
  private intervalTotalMs: number = 0;
  private intervalCount: number = 0;

  constructor(private testService: SignalrTestService) {}

  async startTest() {
    if (this.connection) await this.stopTest();

    this.diagnostic = { status: 'connecting', packetCount: 0 };
    this.receivedData = null;
    this.startTime = performance.now();
    this.resetIntervalMetrics();

    try {
      // 1. Create isolated connection
      this.connection = this.testService.createConnection('DISPENSER');

      // 2. Set up high-performance listener
      this.connection.on('ReceiveStationDispensers', (data) => {
        const now = new Date();
        const receivedAt = performance.now();
        const packetNumber = this.diagnostic.packetCount + 1;

        if (this.previousPacketTime !== null) {
          this.updateIntervalMetrics(
            Math.round(receivedAt - this.previousPacketTime),
            now,
            packetNumber,
          );
        }
        if (this.diagnostic.packetCount === 0) {
          this.diagnostic.latency = Math.round(performance.now() - this.startTime);
          console.log(`✅ [Dispenser Test] First Signal Received! Latency: ${this.diagnostic.latency}ms`);
        } else {
          console.log(`📦 [Dispenser Test] Packet #${this.diagnostic.packetCount + 1} Received at ${now.toLocaleTimeString()}`);
        }
        
        this.diagnostic.packetCount++;
        this.diagnostic.lastPacketTime = now;
        this.diagnostic.status = 'connected';
        this.receivedData = data;
        this.previousPacketTime = receivedAt;
        
        // Trigger UI Flash
        this.flashActive = true;
        setTimeout(() => this.flashActive = false, 500);
      });

      // 3. Monitor connection lifecycle
      this.connection.onclose((err) => this.handleError('Connection Closed', err?.message));

      // 4. Start and Join
      await this.connection.start();
      await this.connection.invoke('JoinStationGroup', Number(this.stationId));
      
      console.log('🚀 [Test] Dispenser Connection Established');
    } catch (err: any) {
      this.handleError(err.name || 'Startup Error', err.message);
    }
  }

  formatDuration(milliseconds: number | null): string {
    if (milliseconds === null) return '---';
    if (milliseconds < 1000) return `${milliseconds} ms`;
    return `${(milliseconds / 1000).toFixed(2)} s`;
  }

  private updateIntervalMetrics(intervalMs: number, receivedAt: Date, packet: number) {
    this.lastIntervalMs = intervalMs;
    this.intervalTotalMs += intervalMs;
    this.intervalCount++;
    this.averageIntervalMs = Math.round(this.intervalTotalMs / this.intervalCount);
    this.minIntervalMs = this.minIntervalMs === null ? intervalMs : Math.min(this.minIntervalMs, intervalMs);
    this.maxIntervalMs = this.maxIntervalMs === null ? intervalMs : Math.max(this.maxIntervalMs, intervalMs);
    this.intervalHistory = [{ packet, receivedAt, intervalMs }, ...this.intervalHistory].slice(0, 20);

    console.log(`[Dispenser Test] Packet #${packet} interval: ${this.formatDuration(intervalMs)}`);
  }

  private resetIntervalMetrics() {
    this.previousPacketTime = null;
    this.intervalTotalMs = 0;
    this.intervalCount = 0;
    this.lastIntervalMs = null;
    this.averageIntervalMs = null;
    this.minIntervalMs = null;
    this.maxIntervalMs = null;
    this.intervalHistory = [];
  }

  private handleError(type: string, msg?: string) {
    this.diagnostic.status = 'error';
    this.diagnostic.errorType = type;
    this.diagnostic.errorMessage = msg || 'Unknown failure occurred';
    console.error(`❌ [Test Error] ${type}:`, msg);
  }

  async stopTest() {
    if (this.connection) {
      try {
        await this.connection.stop();
        this.connection = null;
        this.diagnostic.status = 'disconnected';
      } catch (err) {
        console.error('Error stopping connection:', err);
      }
    }
  }

  ngOnDestroy() {
    this.stopTest();
  }
}
