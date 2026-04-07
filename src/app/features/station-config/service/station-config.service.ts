import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../env/environment';

export interface Station {
  id?: number;
  name: string;
  stationName?: string; // used in GET response
  location: string;
  address: string;
  latitude: string;
  longitude: string;
  priceconversionValue: number;
  consumptionconversionValue?: number;
  zoneId: number;
  phone?: string;
  email?: string;
  status?: string;
  zoneName?: string;
}

@Injectable({
  providedIn: 'root',
})
export class StationConfigService {
  private http = inject(HttpClient);
  private apiUrl = environment.url + 'Stations';

  getStations(page: number = 1, pageSize: number = 10, search: string = ''): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/All-Stations?page=${page}&pageSize=${pageSize}&search=${search}`,
    );
  }

  createStation(station: Station): Observable<any> {
    return this.http.post(this.apiUrl, station);
  }

  updateStation(id: number, station: Station): Observable<any> {
    // Note: User added consumptionconversionValue: 0 in PUT payload example
    const payload = {
      ...station,
      consumptionconversionValue: station.consumptionconversionValue ?? 0,
    };
    return this.http.put(`${this.apiUrl}/${id}`, payload);
  }

  deleteStation(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getZones(): Observable<any[]> {
    return this.http.get<any[]>(environment.url + 'Zone/GetAllZones');
  }

  getDispensers(): Observable<any[]> {
    return this.http.get<any[]>(environment.url + 'Dispenser/dispensers/all');
  }

  deleteDispenser(id: number): Observable<any> {
    return this.http.delete(environment.url + `Dispenser/${id}`);
  }

  getMachines(): Observable<any[]> {
    return this.http.get<any[]>(environment.url + 'Machine');
  }

  createMachine(data: any): Observable<any> {
    return this.http.post(environment.url + 'Machine', data);
  }

  createDispenser(data: any): Observable<any> {
    return this.http.post(environment.url + 'Dispenser', data);
  }

  getZonesWithStations(): Observable<any[]> {
    return this.http.get<any[]>(environment.url + 'Zone/GetAllZonesWithStations');
  }

  createZone(name: string): Observable<any> {
    return this.http.post(`${environment.url}Zone`, { name: name });
  }

  updateZone(id: number, name: string): Observable<any> {
    return this.http.put(`${environment.url}Zone/UpdateZone/${id}`, { id: id, name: name });
  }

  deleteZone(id: number): Observable<any> {
    return this.http.delete(`${environment.url}Zone/DeleteZone/${id}`);
  }

  // --- COMPRESSORS ---
  getCompressors(): Observable<any[]> {
    return this.http.get<any[]>(environment.url + 'Compressor/GetAll');
  }

  getCompressorById(id: number): Observable<any> {
    return this.http.get<any>(`${environment.url}Compressor/${id}`);
  }

  createCompressor(data: any): Observable<any> {
    return this.http.post(environment.url + 'Compressor', data);
  }

  updateCompressor(id: number, data: any): Observable<any> {
    return this.http.put(`${environment.url}Compressor/${id}`, data);
  }

  deleteCompressor(id: number): Observable<any> {
    return this.http.delete(`${environment.url}Compressor/${id}`);
  }

  unlinkCompressor(id: number, userId: number = 0): Observable<any> {
    return this.http.post(`${environment.url}compressors/${id}/unlink`, { userId });
  }

  getAssetLinkHistory(): Observable<any[]> {
    const url = environment.url.replace('/api/', '/') + 'asset-link-history';
    return this.http.get<any[]>(url);
  }

  // --- ASSETS ---
  getAssets(): Observable<any[]> {
    return this.http.get<any[]>(environment.url + 'Asset');
  }

  getAssetById(id: number): Observable<any> {
    return this.http.get<any>(`${environment.url}Asset/${id}`);
  }

  createAsset(data: any): Observable<any> {
    return this.http.post(environment.url + 'Asset', data);
  }

  updateAsset(id: number, data: any): Observable<any> {
    return this.http.put(`${environment.url}Asset/${id}`, data);
  }

  getAvailableAssets(): Observable<any[]> {
    return this.http.get<any[]>(environment.url + 'Asset/available');
  }
}
