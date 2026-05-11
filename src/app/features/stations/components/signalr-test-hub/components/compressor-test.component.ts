import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SignalrTestService, TestDiagnostic } from '../service/signalr-test.service';
import * as signalR from '@microsoft/signalr';

@Component({
  selector: 'app-compressor-test',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './compressor-test.component.html',
  styleUrls: ['./compressor-test.component.css']
})
export class CompressorTestComponent implements OnDestroy {
  stationId: number = 1;
  diagnostic: TestDiagnostic = { status: 'disconnected', packetCount: 0 };
  receivedData: any = null;
  flashActive: boolean = false;
  
  private connection: signalR.HubConnection | null = null;
  private startTime: number = 0;

  constructor(private testService: SignalrTestService) {}

  async startTest() {
    if (this.connection) await this.stopTest();

    this.diagnostic = { status: 'connecting', packetCount: 0 };
    this.receivedData = null;
    this.startTime = performance.now();

    try {
      // 1. Create isolated connection
      this.connection = this.testService.createConnection('COMPRESSOR');

      // 2. Set up high-performance listener
      this.connection.on('ReceiveDashboard', (data) => {
        const now = new Date();
        if (this.diagnostic.packetCount === 0) {
          this.diagnostic.latency = Math.round(performance.now() - this.startTime);
          console.log(`✅ [Compressor Test] First Signal Received! Latency: ${this.diagnostic.latency}ms`);
        } else {
          console.log(`📦 [Compressor Test] Packet #${this.diagnostic.packetCount + 1} Received at ${now.toLocaleTimeString()}`);
        }
        
        this.diagnostic.packetCount++;
        this.diagnostic.lastPacketTime = now;
        this.diagnostic.status = 'connected';
        this.receivedData = data;
        
        // Trigger UI Flash
        this.flashActive = true;
        setTimeout(() => this.flashActive = false, 500);
      });

      // 3. Monitor connection lifecycle
      this.connection.onclose((err) => this.handleError('Connection Closed', err?.message));

      // 4. Start and Join
      await this.connection.start();
      await this.connection.invoke('JoinStation', Number(this.stationId));
      
      console.log('🚀 [Test] Compressor Connection Established');
    } catch (err: any) {
      this.handleError(err.name || 'Startup Error', err.message);
    }
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
