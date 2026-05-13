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

  // Selected station ID as a signal
  private selectedStationId = signal<number | null>(null);

  // Selected station data as a reactive computed signal
  // This updates AUTOMATICALLY whenever bridge.activeStations changes
  selectedStation = computed(() => {
    const id = this.selectedStationId();
    if (!id) return null;
    return this.bridge.activeStations().find(s => s.stationId === id) || null;
  });

  // Map stations from API (have coordinates)
  private mapStations: any[] = [];

  // Computed stats
  totalStations = computed(() => this.bridge.activeStations().length);
  onlineCount = computed(() => this.bridge.activeStations().filter(s => s.status === 'Online' || s.status === 'Running').length);
  alarmCount = computed(() => this.bridge.activeStations().filter(s => s.status === 'Alarm').length);
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

    // Gray/Light tile layer (CartoDB Positron)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
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
    // 1. Leave previous station groups if any
    const prevId = this.selectedStationId();
    if (prevId !== null && prevId !== stationId) {
      this.bridge.leaveStationGroups(prevId);
    }

    // 2. Set selectedStationId immediately to trigger UI Sidebar
    this.selectedStationId.set(stationId);

    // 3. Join SignalR groups and fetch metadata in background
    this.bridge.joinStationGroups(stationId);
    this.bridge.fetchStationMetadata(stationId);

    // 4. Fly to station location
    if (this.map) {
      this.map.flyTo([lat, lng], 14, { duration: 1.5 });
    }
  }

  closeDetail() {
    const id = this.selectedStationId();
    if (id !== null) {
      this.bridge.leaveStationGroups(id);
    }
    
    this.selectedStationId.set(null);

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
    if (this.map) {
      this.map.remove();
    }
  }
}
