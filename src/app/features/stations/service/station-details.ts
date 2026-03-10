import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../env/environment';

@Injectable({
  providedIn: 'root',
})
export class StationDetails {
  private http = inject(HttpClient);
  getStationById(id: number): Observable<any> {
    return this.http.get(`${environment.url}Stations/${id}/details`);
  }
  getComproserById(id: number): Observable<any> {
    return this.http.get(`${environment.url}Stations/${id}/compressors`);
  }
}
