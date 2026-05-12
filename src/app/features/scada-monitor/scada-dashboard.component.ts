import { Component, inject, computed, signal, OnInit, OnDestroy, AfterViewInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScadaDataBridgeService } from './services/scada-data-bridge.service';
import { dashboardService } from '../dashboard/service/dashboard';
import { ScadaStation } from './models/scada.model';
import * as L from 'leaflet';

@Component({
  selector: 'app-scada-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './scada-dashboard.component.html',
  styleUrl: './scada-dashboard.component.scss'
})
export class ScadaDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private bridge = inject(ScadaDataBridgeService);
  private dashService = inject(dashboardService);
  private ngZone = inject(NgZone);

  // Map state
  private map!: L.Map;
  private markers: Map<number, L.Marker> = new Map();
  private defaultBounds!: L.LatLngBounds;
  isMapLoading = true;
  showLog = false;

  // Station data from bridge (real-time)
  stations = this.bridge.activeStations;
  eventLog = this.bridge.eventLog;

  // Selected station for detail panel
  selectedStation: ScadaStation | null = null;
  private selectedStationId: number | null = null;

  // Map stations from API (have coordinates)
  private mapStations: any[] = [];

  // Computed stats
  totalStations = computed(() => this.stations().length);
  onlineCount = computed(() => this.stations().filter(s => s.status === 'Online' || s.status === 'Running').length);
  alarmCount = computed(() => this.stations().filter(s => s.status === 'Alarm').length);
  newEventsCount = computed(() => this.eventLog().length);

  ngOnInit() {
    // Real-time data subscription is handled by the bridge service automatically
  }

  ngAfterViewInit() {
    // Fetch map coordinates from API then initialize map
    this.dashService.dashboardMap().subscribe({
      next: (res) => {
        this.mapStations = res;
        this.ngZone.runOutsideAngular(() => {
          this.initMap();
        });
      },
      error: (err) => {
        console.error('Failed to load map data:', err);
        this.isMapLoading = false;
      }
    });
  }

  private initMap() {
    const validStations = this.mapStations.filter(
      s => s.latitude && s.longitude && !isNaN(parseFloat(s.latitude)) && !isNaN(parseFloat(s.longitude))
    );

    if (validStations.length === 0) {
      this.isMapLoading = false;
      return;
    }

    // Calculate center
    let totalLat = 0, totalLng = 0;
    validStations.forEach(s => {
      totalLat += parseFloat(s.latitude);
      totalLng += parseFloat(s.longitude);
    });
    const centerLat = totalLat / validStations.length;
    const centerLng = totalLng / validStations.length;

    // Create map with dark theme
    this.map = L.map('scada-map', {
      zoomControl: false, // We use custom controls
      center: [centerLat, centerLng],
      zoom: 8,
      attributionControl: true
    });

    // Dark tile layer (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© CartoDB © OpenStreetMap contributors',
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(this.map);

    // Add zoom control to bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    // Build bounds and add markers
    const bounds = L.latLngBounds([]);

    validStations.forEach(station => {
      const lat = parseFloat(station.latitude);
      const lng = parseFloat(station.longitude);
      bounds.extend([lat, lng]);

      const statusClass = this.getMarkerStatusClass(station.status);

      const icon = L.divIcon({
        className: 'scada-marker',
        html: `
          <div class="marker-dot ${statusClass}"></div>
          <div class="marker-label">${station.stationName || station.name || 'Station'}</div>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      const marker = L.marker([lat, lng], { icon }).addTo(this.map);

      // Click → fly to station and show detail
      marker.on('click', () => {
        this.ngZone.run(() => {
          this.selectStation(station.stationId || station.id, lat, lng);
        });
      });

      // Hover → show label
      marker.on('mouseover', () => {
        const el = marker.getElement();
        if (el) el.classList.add('show-label');
      });
      marker.on('mouseout', () => {
        const el = marker.getElement();
        if (el) el.classList.remove('show-label');
      });

      this.markers.set(station.stationId || station.id, marker);
    });

    // Store default bounds
    if (bounds.isValid()) {
      this.defaultBounds = bounds;
      this.map.fitBounds(bounds, { padding: [80, 80], maxZoom: 10 });
    }

    // Ensure map renders correctly
    setTimeout(() => {
      this.map.invalidateSize();
      this.ngZone.run(() => {
        this.isMapLoading = false;
      });
    }, 300);
  }

  selectStation(stationId: number, lat: number, lng: number) {
    this.selectedStationId = stationId;

    // Find real-time data from bridge
    const bridgeStation = this.stations().find(s => s.stationId === stationId);
    if (bridgeStation) {
      this.selectedStation = bridgeStation;
    } else {
      // Fallback: create minimal station from map data
      const mapStation = this.mapStations.find(s => (s.stationId || s.id) === stationId);
      this.selectedStation = {
        stationId,
        name: mapStation?.stationName || mapStation?.name || `Station ${stationId}`,
        status: mapStation?.status === 'Active' ? 'Online' : 'Offline',
        zone: mapStation?.zoneName,
        dispensers: [],
        kpis: { totalFlow: 0, inletPressure: 0, outletPressure: 0 }
      };
    }

    // Fly to station location with smooth animation
    if (this.map) {
      this.map.flyTo([lat, lng], 14, {
        duration: 1.8,
        easeLinearity: 0.25
      });
    }

    // Keep updating selected station from bridge signals
    this.startRealtimeSync();
  }

  private realtimeSyncInterval: any = null;

  private startRealtimeSync() {
    // Poll the bridge signal every second to keep detail panel in sync
    this.stopRealtimeSync();
    this.realtimeSyncInterval = setInterval(() => {
      if (this.selectedStationId !== null) {
        const updated = this.stations().find(s => s.stationId === this.selectedStationId);
        if (updated) {
          this.selectedStation = { ...updated };
        }
      }
    }, 1000);
  }

  private stopRealtimeSync() {
    if (this.realtimeSyncInterval) {
      clearInterval(this.realtimeSyncInterval);
      this.realtimeSyncInterval = null;
    }
  }

  closeDetail() {
    this.selectedStation = null;
    this.selectedStationId = null;
    this.stopRealtimeSync();

    // Fly back to default view
    if (this.map && this.defaultBounds) {
      this.map.flyToBounds(this.defaultBounds, {
        padding: [80, 80],
        maxZoom: 10,
        duration: 1.5
      });
    }
  }

  resetMapView() {
    this.closeDetail();
  }

  toggleLog() {
    this.showLog = !this.showLog;
  }

  getStatusClass(status: string): string {
    const s = (status || '').toLowerCase();
    if (s === 'alarm') return 'alarm';
    if (s === 'online' || s === 'running' || s === 'active') return 'online';
    return 'offline';
  }

  private getMarkerStatusClass(status: string): string {
    const s = (status || '').toLowerCase();
    if (s === 'alarm') return 'status-alarm';
    if (s === 'active' || s === 'online' || s === 'running') return 'status-online';
    return 'status-offline';
  }

  ngOnDestroy() {
    this.stopRealtimeSync();
    if (this.map) {
      this.map.remove();
    }
  }
}
