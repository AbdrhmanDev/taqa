import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../env/environment';
import { IAddRole, IRoles } from '../models/iroles';
@Injectable({
  providedIn: 'root',
})
export class Role {
  constructor(private http: HttpClient) {}
  getAllRoles(): Observable<IRoles[]> {
    return this.http.get<IRoles[]>(environment.url + 'auth/GetAllRoles');
  }
  getAllClaims(): Observable<string> {
    return this.http.get<string>(environment.url + 'auth/GetAllClaims');
  }
  getAllZones(): Observable<string> {
    return this.http.get<string>(environment.url + 'Zone/GetAllZones');
  }
  deleteRole(roleName: string): Observable<string> {
    return this.http.delete(environment.url + 'auth/DeleteRole/' + roleName, {
      responseType: 'text',
    });
  }
  getAllAreas(): Observable<any> {
    return this.http.get(environment.url + 'Area/GetAllAreas');
  }
  addRole(data: IAddRole | any): Observable<string> {
    return this.http.post<string>(environment.url + 'auth/AddRoles', data);
  }
  editRole(payload: any): Observable<string> {
    return this.http.put<string>(environment.url + 'auth/UpdateRole', payload);
  }
}
