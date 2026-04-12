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

  dashboardHighest(): Observable<any> {
    return this.http.get(environment.url + 'Dashboard/highest-consumption-stations');
  }
  hourlyRevenue(): Observable<any> {
    return this.http.get(environment.url + 'Dashboard/hourly-revenue');
  }
  hourlyVehicles(): Observable<any> {
    return this.http.get(environment.url + 'Dashboard/hourly-vehicles-charged');
  }
  hourlyGasSold(): Observable<any> {
    return this.http.get(environment.url + 'Dashboard/hourly-gas-sold');
  }

  dashboardAlarms(
    stationId?: any,
    severity?: any,
    from?: string,
    to?: string,
  ): Observable<any> {
    let params: any = {};
    if (stationId !== undefined && stationId !== null && stationId !== '')
      params.stationId = stationId;
    if (severity !== undefined && severity !== null && severity !== '') params.severity = severity;
    if (from) params.from = from;
    if (to) params.to = to;

    return this.http.get(environment.url + 'Alarms/history', { params });
  }
  StationAlarmById(stationId: any): Observable<any> {
    return this.http.get(environment.url + 'Alarms/history', { params: { stationId } });
  }
  dashboardMap(): Observable<any> {
    return this.http.get(environment.url + 'Dashboard/stations-map');
  }
  dashboardTable(): Observable<any> {
    return this.http.get(environment.url + 'Dashboard/stations-uptime');
  }
  getAllStation(): Observable<any> {
    return this.http.get(environment.url + 'Stations/All-Stations');
  }
  getAllSeverity(): Observable<any> {
    return this.http.get(environment.url + 'Alarms/severities');
  }
}
