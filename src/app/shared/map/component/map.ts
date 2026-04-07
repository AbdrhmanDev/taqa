import {
  Component,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-container" #mapContainer>
      <div id="map-{{ uniqueId }}" class="map-element"></div>
    </div>
  `,
  styles: [
    `
      .map-container {
        width: 100%;
        height: 100%;
        min-height: 300px;
        position: relative;
        border-radius: 12px;
        overflow: hidden;
      }
      .map-element {
        width: 100%;
        height: 100%;
      }
    `,
  ],
})
export class MapComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() centers: [number, number] = [30.0444, 31.2357];
  @Input() zoom: number = 10;
  @Input() markers: any[] = [];
  @Input() isPicker: boolean = false;
  @Input() selectedLocation: { lat: number; lng: number } | null = null;

  @Output() locationSelected = new EventEmitter<{ lat: number; lng: number }>();

  @ViewChild('mapContainer') mapContainer!: ElementRef;

  private map!: L.Map;
  private markerLayer = L.layerGroup();
  private pickerMarker: L.Marker | null = null;
  uniqueId = Math.random().toString(36).substring(2, 9);

  ngAfterViewInit() {
    this.initMap();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.map) {
      if (changes['markers']) {
        this.updateMarkers();
      }
      if (changes['selectedLocation'] && this.isPicker) {
        this.updatePickerMarker();
      }
    }
  }

  private initMap() {
    const mapId = `map-${this.uniqueId}`;
    this.map = L.map(mapId, {
      center: this.centers,
      zoom: this.zoom,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    this.markerLayer.addTo(this.map);

    if (this.isPicker) {
      this.map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        this.locationSelected.emit({ lat, lng });
        this.setPickerMarker(lat, lng);
      });

      if (this.selectedLocation) {
        this.setPickerMarker(this.selectedLocation.lat, this.selectedLocation.lng);
      }
    } else {
      this.updateMarkers();
    }

    setTimeout(() => {
      this.map.invalidateSize();
    }, 200);
  }

  private updateMarkers() {
    this.markerLayer.clearLayers();
    if (!this.markers || this.markers.length === 0) return;

    const bounds = L.latLngBounds([]);
    this.markers.forEach((m) => {
      if (m.latitude && m.longitude) {
        const lat = parseFloat(m.latitude);
        const lng = parseFloat(m.longitude);
        bounds.extend([lat, lng]);

        const icon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="width: 12px; height: 12px; background: ${m.color || '#3b82f6'}; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3); cursor: pointer;"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });

        const marker = L.marker([lat, lng], { icon }).addTo(this.markerLayer);
        if (m.label) {
          marker.bindPopup(m.label);
        }
      }
    });

    if (bounds.isValid()) {
      this.map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }

  private setPickerMarker(lat: number, lng: number) {
    if (this.pickerMarker) {
      this.pickerMarker.setLatLng([lat, lng]);
    } else {
      const icon = L.icon({
        iconUrl: 'assets/Images/marker-icon.png', // Assuming markers are standard or the user provided some
        shadowUrl: 'assets/Images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });
      // Fallback to div icon if assets missing
      const divIcon = L.divIcon({
        className: 'picker-marker',
        html: `<div style="width: 24px; height: 24px; background: #ef4444; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.5);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      this.pickerMarker = L.marker([lat, lng], { icon: divIcon }).addTo(this.map);
    }
    this.map.setView([lat, lng], this.map.getZoom());
  }

  private updatePickerMarker() {
    if (this.selectedLocation) {
      this.setPickerMarker(this.selectedLocation.lat, this.selectedLocation.lng);
    } else if (this.pickerMarker) {
      this.map.removeLayer(this.pickerMarker);
      this.pickerMarker = null;
    }
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }
}
