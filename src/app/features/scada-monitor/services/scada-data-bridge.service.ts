import { Injectable, inject, signal, WritableSignal, OnDestroy } from '@angular/core';
import { RealtimeStationDetails } from '../../stations/service/realtime-station-details';
import { AlarmsStationDetails } from '../../stations/service/alarms-station-details';
import { StationConfigService } from '../../station-config/service/station-config.service';
import { Subscription, firstValueFrom } from 'rxjs';
import { ScadaStation, ScadaCompressor, ScadaDispenser } from '../models/scada.model';

@Injectable({
  providedIn: 'root'
})
export class ScadaDataBridgeService implements OnDestroy {
  private realtime = inject(RealtimeStationDetails);
  private alarms = inject(AlarmsStationDetails);
  private config = inject(StationConfigService);

  // Writable Signals for state
  public activeStations: WritableSignal<ScadaStation[]> = signal([]);
  public eventLog: WritableSignal<any[]> = signal([]);

  private subscriptions: Subscription[] = [];

  constructor() {
    this.initSubscriptions();
  }

  private async initSubscriptions() {
    try {
      // 1. Fetch initial station list
      const res = await firstValueFrom(this.config.getStations(1, 100));
      const stationsFromApi = res.items || [];
      
      this.activeStations.set(stationsFromApi.map((s: any) => ({
        stationId: s.id,
        name: s.stationName || s.name,
        zone: s.zoneName || s.zone, // Critical for filtering!
        status: 'Offline',
        kpis: { totalFlow: 0, inletPressure: 0, outletPressure: 0 },
        dispensers: [],
        lastSignal: new Date().toISOString()
      })));

      // 2. Start connections to ensure they exist for this service
      // This is necessary because the underlying services don't share connection state safely
      console.log('SCADA Bridge: Starting connections...');
      await this.realtime.startConnection();
      await this.realtime.startConnectionCompressor();
      await this.realtime.startConnectionDispenser();
      await this.alarms.startConnection();

      // 3. Register Listeners FIRST before joining groups to not miss any messages
      this.subscriptions.push(
        this.realtime.getStationDetails().subscribe(data => this.updateStationData(data))
      );
      this.subscriptions.push(
        this.realtime.getCompressorDetails().subscribe(data => this.updateCompressorData(Array.isArray(data) ? data[0] : data))
      );
      this.subscriptions.push(
        this.realtime.getDispenserDetails().subscribe(data => this.updateDispenserData(data))
      );
      this.subscriptions.push(
        this.alarms.getStationDetails().subscribe(alarm => this.handleAlarm(alarm))
      );

      console.log('SCADA Bridge: Subscriptions active. Joining groups...');

      // 4. Attempt to join groups for each station
      for (const station of stationsFromApi) {
        this.safeJoin(station.id);
      }

    } catch (error) {
      console.error('SCADA Bridge Init Error:', error);
    }
  }

  private async safeJoin(sid: number) {
    // Try to join, if it fails because not connected, we try to start connection once
    try {
      await this.realtime.joinStation(sid);
      await this.realtime.joinCompressor(sid);
      await this.realtime.joinDispenser(sid);
      await this.alarms.joinStation(sid);
    } catch (e: any) {
      if (e?.toString().includes('Connected')) {
        console.warn(`Station ${sid} join deferred: Connection not ready. Retrying in 5s...`);
        setTimeout(() => this.safeJoin(sid), 5000);
      }
    }
  }

  private updateStationData(data: any) {
    if (!data) return;
    const sid = data.stationId || data.stationID || data.id;
    if (!sid) return;

    console.log(`SCADA Bridge [KPI]: Data for Station ${sid}`, data);

    this.activeStations.update(stations => {
      const index = stations.findIndex(s => s.stationId === sid);
      if (index === -1) {
        console.warn(`SCADA Bridge [KPI]: Station ${sid} not found in local list`);
        return stations;
      }

      const station = { ...stations[index] }; // Shallow copy
      station.status = 'Online';
      station.lastSignal = new Date().toISOString();
      
      // Map fields based on actual backend structure observed in logs
      station.kpis = {
        totalFlow: data.gasVolumeSold || data.totalFlow || station.kpis.totalFlow,
        inletPressure: data.inletPressure || 0,
        outletPressure: data.outletPressure || 0,
        revenue: data.totalRevenue || station.kpis.revenue || 0,
        vehicles: data.vehiclesCharged || station.kpis.vehicles || 0,
        shiftStartTime: data.shiftStartTime || station.kpis.shiftStartTime
      };

      stations[index] = station;
      return [...stations];
    });
  }

  private updateCompressorData(data: any) {
    if (!data) return;
    const sid = data.stationId || data.stationID || data.id;
    if (!sid) return;

    console.log(`SCADA Bridge [COMP]: Data for Station ${sid}`, data);

    this.activeStations.update(stations => {
      const index = stations.findIndex(s => s.stationId === sid);
      if (index === -1) return stations;

      const station = { ...stations[index] };
      station.lastSignal = new Date().toISOString();
      station.compressor = {
        id: data.compressorId || data.id || data.brokerId,
        model: data.model || 'Standard',
        status: data.statusName || data.status || 'Running',
        vibration: data.vibration || 0,
        oilPressure: data.oilPressure || 0,
        stages: (data.pressureStages || []).map((p: any, i: number) => ({
          pressure: p,
          temperature: data.temperatureStages ? data.temperatureStages[i] : 0
        }))
      };

      stations[index] = station;
      return [...stations];
    });
  }

  private updateDispenserData(data: any) {
    if (!data) return;
    const dispenserArray = Array.isArray(data) ? data : [data];
    if (dispenserArray.length === 0) return;

    const sid = dispenserArray[0].stationId || dispenserArray[0].stationID;
    console.log(`SCADA Bridge [DISP]: Data for Station ${sid}`, dispenserArray);

    this.activeStations.update(stations => {
      const index = stations.findIndex(s => s.stationId === sid);
      if (index === -1) return stations;

      const station = { ...stations[index] };
      station.lastSignal = new Date().toISOString();
      station.dispensers = dispenserArray.map((d: any) => ({
        id: d.dispenserId || d.id,
        name: d.dispenserName || d.name || `Dispenser ${d.id}`,
        status: (d.status === 'Active' || d.status === 'Filling' || d.isFilling) ? 'Filling' : 'Idle',
        currentReading: d.currentReading || 0
      }));

      stations[index] = station;
      return [...stations];
    });
  }

  private handleAlarm(alarm: any) {
    this.eventLog.update(logs => [{ ...alarm, timestamp: new Date() }, ...logs.slice(0, 49)]);
    
    // Update station status if alarm is critical
    this.activeStations.update(stations => {
      const station = stations.find(s => s.stationId === alarm.stationId);
      if (station) {
        station.status = 'Alarm';
      }
      return [...stations];
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.realtime.stopConnection();
    this.realtime.stopConnectionCompressor();
    this.realtime.stopConnectionDispenser();
    this.alarms.stopConnection();
  }
}
