import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../env/environment';
import { Iarea } from '../models/iarea';

@Injectable({
  providedIn: 'root',
})
export class AreaService {
  constructor(private http: HttpClient) {}

  getAllAreas(): Observable<Iarea[]> {
    return this.http.get<Iarea[]>(environment.url + 'Area/GetAllAreas');
  }

  getAreasByZone(zoneId: number): Observable<Iarea[]> {
    return this.http.get<Iarea[]>(environment.url + 'Area/ByZone/' + zoneId);
  }

  getAreaById(id: number): Observable<Iarea> {
    return this.http.get<Iarea>(environment.url + 'Area/' + id);
  }

  addArea(data: { name: string; zoneId: number }): Observable<Iarea> {
    return this.http.post<Iarea>(environment.url + 'Area/AddArea', data);
  }

  updateArea(id: number, data: { name: string; zoneId: number }): Observable<Iarea> {
    return this.http.put<Iarea>(environment.url + 'Area/UpdateArea/' + id, data);
  }

  deleteArea(id: number): Observable<any> {
    return this.http.delete(environment.url + 'Area/DeleteArea/' + id);
  }
}
