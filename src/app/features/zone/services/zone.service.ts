import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../env/environment';
import { Izone } from '../models/izone';

@Injectable({
  providedIn: 'root',
})
export class ZoneService {
  constructor(private http: HttpClient) {}

  getAllZones(): Observable<Izone[]> {
    return this.http.get<Izone[]>(environment.url + 'Zone/GetAllZones');
  }

  getZoneById(id: number): Observable<Izone> {
    return this.http.get<Izone>(environment.url + 'Zone/' + id);
  }

  addZone(name: string): Observable<Izone> {
    return this.http.post<Izone>(environment.url + 'Zone/AddZone', { name });
  }

  updateZone(id: number, name: string): Observable<Izone> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<Izone>(environment.url + 'Zone/UpdateZone/' + id, JSON.stringify(name), { headers });
  }

  deleteZone(id: number): Observable<any> {
    return this.http.delete(environment.url + 'Zone/DeleteZone/' + id);
  }
}
