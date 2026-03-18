import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../env/environment';
@Injectable({
  providedIn: 'root',
})
export class AllStation {
  private http = inject(HttpClient);
  getStationSummary(): Observable<any> {
    return this.http.get(environment.url + 'Stations/cards-summary');
  }
  getAllStations(page: number, pageSize: number, search?: string): Observable<any> {
    return this.http.get(
      environment.url +
        `Stations/All-Stations?page=${page}&pageSize=${pageSize}&search=${search ?? ''}`,
    );
  }
  getAllZones(): Observable<any> {
    return this.http.get(environment.url + 'Zone/GetAllZones');
  }
}
