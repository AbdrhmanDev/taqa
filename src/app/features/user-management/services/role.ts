import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../env/environment';
@Injectable({
  providedIn: 'root',
})
export class Role {
  constructor(private http: HttpClient) {}
  getAllRoles(): Observable<string> {
    return this.http.get<string>(environment.url + 'auth/GetAllRoles');
  }
  getAllClaims(): Observable<string> {
    return this.http.get<string>(environment.url + 'auth/GetAllClaims');
  }
  getAllAreas(): Observable<string> {
    return this.http.get<string>(environment.url + 'auth/GetAllAreas');
  }
  deleteRole(roleName: string): Observable<string> {
    return this.http.delete(environment.url + 'auth/DeleteRole/' + roleName, {
      responseType: 'text',
    });
  }
}
