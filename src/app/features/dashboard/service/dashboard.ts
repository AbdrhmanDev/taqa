import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../env/environment';
@Injectable({
  providedIn: 'root',
})
export class dashboardService {
  constructor(private http: HttpClient) {}
  dashboardSummary(duration: number, from: string = '', to: string = ''): Observable<any> {
    let params: any = { duration };

    if (duration === 5) {
      params.from = from;
      params.to = to;
    }
    return this.http.get(environment.url + 'Dashboard/summary', { params });
  }
  dashboardRevenue(duration: number, from: string = '', to: string = ''): Observable<any> {
    let params: any = { duration };
    if (duration === 5) {
      params.from = from;
      params.to = to;
    }
    return this.http.get(environment.url + 'Dashboard/revenue-trend', { params });
  }
  dashboardGas(duration: number, from: string = '', to: string = ''): Observable<any> {
    let params: any = { duration };
    if (duration === 5) {
      params.from = from;
      params.to = to;
    }
    return this.http.get(environment.url + 'Dashboard/gas-volume-trend', { params });
  }
}
