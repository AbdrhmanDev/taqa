import { LinkComprosser } from './../components/over-view/link-comprosser/link-comprosser';
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
  getGasById(id: number, duration: number, from?: string, to?: string): Observable<any> {
    const params: any = {
      duration: duration,
    };

    if (duration === 5 && from && to) {
      params.durationStartTime = from;
      params.durationEndTime = to;
    }

    return this.http.get(`${environment.url}Stations/${id}/gas-consumption`, { params });
  }
  getDispenserById(id: number): Observable<any> {
    return this.http.get(`${environment.url}Dispenser/${id}/dispensers`);
  }
  getCompressorById(id: number): Observable<any> {
    return this.http.get(`${environment.url}Compressor/by-station/${id}`);
  }

  getTimeLineChart(id: number): Observable<any> {
    return this.http.get(`${environment.url}Compressor/GetTimeLine/`, {
      params: { stationId: id },
    });
  }

  unlinkCompressor(compressorId: number, userId: number = 0): Observable<any> {
    return this.http.post(`${environment.url}compressors/${compressorId}/unlink`, { userId });
  }

  linkCompressor(compressorId: number, assetId: number, userId: number = 0): Observable<any> {
    return this.http.post(`${environment.url}compressors/${compressorId}/link`, {
      assetId,
      userId,
    });
  }

  getAvailableAssetsComproser(): Observable<any> {
    return this.http.get(`${environment.url}compressors/available-assets`);
  }
  getComroserById(compressorId: number): Observable<any> {
    return this.http.get(`${environment.url}Compressor/${compressorId}`);
  }
  getAvaliavleAssets(): Observable<any> {
    return this.http.get(`${environment.url}Asset/available`);
  }
  getAvailableStations(search?: string, pageSize?: number): Observable<any> {
    const params: any = {};
    if (search) params.Search = search;
    if (pageSize) params.PageSize = pageSize;
    return this.http.get(`${environment.url}Stations/All-Stations`, { params });
  }

  addAsset(body: { name: string; serialNumber: string; stationId: number }): Observable<any> {
    return this.http.post(`${environment.url}Asset`, body);
  }
  linkComproser(compressorId: number, assetId: number, userId: number = 0): Observable<any> {
    return this.http.post(`${environment.url}compressors/${compressorId}/link`, {
      assetId,

      userId,
    });
  }

  getPressureHistory(
    stationId: number,
    stage: number,
    date?: string,
    timeFrom?: string,
    timeTo?: string,
    intervalMinutes?: number,
  ): Observable<any> {
    const params: any = {};

    if (date) params.date = date;
    if (timeFrom) params.timeFrom = timeFrom;
    if (timeTo) params.timeTo = timeTo;
    if (intervalMinutes) params.intervalMinutes = intervalMinutes;

    return this.http.get(`${environment.url}Compressor/${stationId}/pressure/${stage}`, { params });
  }

  getTemperatureHistory(
    stationId: number,
    stage: number,
    date?: string,
    timeFrom?: string,
    timeTo?: string,
    intervalMinutes?: number,
  ): Observable<any> {
    const params: any = {};

    if (date) params.date = date;
    if (timeFrom) params.timeFrom = timeFrom;
    if (timeTo) params.timeTo = timeTo;
    if (intervalMinutes) params.intervalMinutes = intervalMinutes;

    return this.http.get(`${environment.url}Compressor/${stationId}/temperature/${stage}`, {
      params,
    });
  }
  getHistoryDispenser(
    machineId: any,
    dispenserNo?: any,
    paramName?: any,
    date?: any,
    timeFrom?: any,
    timeTo?: any,
    intervalMinutes?: any,
  ) {
    const params: any = {};
    if (date) params['date'] = date;
    if (timeFrom) params['timeFrom'] = timeFrom;
    if (timeTo) params['timeTo'] = timeTo;
    if (intervalMinutes) params['intervalMinutes'] = intervalMinutes;

    console.log('Service params:', params); // ← check this in console

    return this.http.get(
      `${environment.url}Dispenser/history/${machineId}/${dispenserNo}/${paramName}`,
      { params },
    );
  }

  getMachinesByStation(stationId: number): Observable<any> {
    return this.http.get(`${environment.url}Machine/station/${stationId}`);
  }

  linkMachine(machineId: number, assetId: number, userId: number = 0): Observable<any> {
    return this.http.post(`${environment.url}machines/${machineId}/link`, {
      assetId,
      userId,
    });
  }

  unlinkMachine(machineId: number, userId: number = 0): Observable<any> {
    return this.http.post(`${environment.url}machines/${machineId}/unlink`, { userId });
  }
}
