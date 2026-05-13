import { Injectable, inject, signal, WritableSignal, OnDestroy } from '@angular/core';
import { RealtimeStationDetails } from '../../stations/service/realtime-station-details';
import { AlarmsStationDetails } from '../../stations/service/alarms-station-details';
import { StationConfigService } from '../../station-config/service/station-config.service';
import { TechOpsRealtime } from '../../dashboard/service/tech-ops-realtime';
import { Subscription, firstValueFrom } from 'rxjs';
import { ScadaStation, ScadaCompressor, ScadaDispenser } from '../models/scada.model';

@Injectable({
  providedIn: 'root'
})
export class ScadaDataBridgeService implements OnDestroy {
  private realtime = inject(RealtimeStationDetails);
  private alarms = inject(AlarmsStationDetails);
  private config = inject(StationConfigService);
  private techOps = inject(TechOpsRealtime);

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
      await this.techOps.startConnection();

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
      this.subscriptions.push(
        this.techOps.techOpsData$.subscribe(data => this.updateTechOpsData(data))
      );

      console.log('SCADA Bridge: Subscriptions active. Joining groups...');

      console.log('SCADA Bridge: Core subscriptions active. Waiting for manual station selection for detailed telemetry.');
      // 4. Join TechOps for all to get basic Online/Offline status on map
      // But we DO NOT join the heavy Realtime hubs here for all stations.
    } catch (error) {
      console.error('SCADA Bridge Init Error:', error);
    }
  }

  public async joinStationGroups(sid: number) {
    console.log(`SCADA Bridge: Joining detailed telemetry groups for station ${sid}`);
    this.safeJoin(sid);
  }

  public async leaveStationGroups(sid: number) {
    console.log(`SCADA Bridge: Leaving detailed telemetry groups for station ${sid}`);
    try {
      await Promise.allSettled([
        this.realtime.leaveStation(sid),
        this.realtime.leaveCompressor(sid),
        this.realtime.leaveDispenser(sid),
        this.alarms.leaveStation(sid)
      ]);
    } catch (e) {
      console.warn(`Failed to leave groups for station ${sid}:`, e);
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

      const station = { ...stations[index] };
      station.status = 'Running';
      station.lastSignal = data.lastTimeStamp || data.timestamp || new Date().toISOString();
      
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
      station.lastSignal = data.lastTimeStamp || data.timestamp || new Date().toISOString();
      station.status = 'Running';
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

    // 1. Try to find Station ID in the payload
    // We check common field names used across different hubs
    const first = dispenserArray[0];
    let sid = first.stationId || first.stationID || first.station_id;

    // 2. If no SID in payload, check if we can infer it from the name or use a fallback
    // In many cases, the machineId at the top level is a dispenser ID, not station ID.
    // However, we know which station we are currently "listening" to.
    console.log('SCADA Bridge [DISP]: Raw payload received', { 
      count: dispenserArray.length, 
      firstMachineId: first.machineId,
      firstCompressor: first.compressorName,
      extractedSid: sid 
    });

    this.activeStations.update(stations => {
      let index = -1;
      if (sid) {
        index = stations.findIndex(s => s.stationId === sid);
      }

      // 3. Fallback: If we still can't find the station by ID, 
      // check if the compressorName in the payload matches any of our stations
      if (index === -1 && first.compressorName) {
        index = stations.findIndex(s => 
          s.name.toLowerCase().includes(first.compressorName.toLowerCase()) ||
          first.compressorName.toLowerCase().includes(s.name.toLowerCase())
        );
      }

      // 4. Last resort: If we are in "On-Demand" mode, the data likely belongs to the
      // station we just joined. We can't be 100% sure, but it's better than ignoring the data.
      // (This is only safe because we use join/leave groups)
      if (index === -1 && dispenserArray.length > 0) {
        // We'll look for a station that is "Online" or "Running" and has no dispensers yet
        // but this is too risky. Let's just log it for now.
        console.warn('SCADA Bridge [DISP]: Could not find matching station for dispensers', first.dispenserName);
      }

      if (index === -1) return stations;

      const station = { ...stations[index] };
      station.lastSignal = first.lastTimeStamp || first.timestamp || new Date().toISOString();
      
      console.log(`SCADA Bridge [DISP]: Updating ${dispenserArray.length} units for Station: ${station.name} (${station.stationId})`);

      station.dispensers = dispenserArray.map((d: any) => ({
        id: d.dispenserId || d.machineId || d.id,
        name: d.dispenserName || d.name,
        status: d.status || (d.connectionStatus === 'Online' ? 'Online' : 'Offline'),
        left: d.left ? {
          volume: d.left.chargeVolume ?? d.left.volume ?? 0,
          throughput: d.left.throughput ?? 0,
          chargingTime: d.left.chargingTime ?? 0,
          waitingTime: d.left.waitingTime ?? 0
        } : undefined,
        right: d.right ? {
          volume: d.right.chargeVolume ?? d.right.volume ?? 0,
          throughput: d.right.throughput ?? 0,
          chargingTime: d.right.chargingTime ?? 0,
          waitingTime: d.right.waitingTime ?? 0
        } : undefined
      }));

      stations[index] = station;
      return [...stations];
    });
  }

  private updateTechOpsData(data: any[]) {
    if (!data || !Array.isArray(data)) return;
    
    console.log('SCADA Bridge [TECH-OPS]: Batch update received', data.length);

    this.activeStations.update(stations => {
      data.forEach(item => {
        const sid = item.stationId || item.stationID || item.id;
        const index = stations.findIndex(s => s.stationId === sid);
        
        if (index !== -1) {
          const station = { ...stations[index] };
          // Tech Ops provides high-level status
          if (item.statusName) {
            station.status = (item.statusName === 'Online' || item.statusName === 'Active') ? 'Online' : 'Offline';
          }
          
          // Optionally map other basic fields if they aren't provided by detailed hubs
          if (!station.kpis.revenue && item.totalRevenue) station.kpis.revenue = item.totalRevenue;
          
          stations[index] = station;
        }
      });
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
