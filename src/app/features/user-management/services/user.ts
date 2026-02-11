import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../env/environment';
import { IUser } from '../models/iuser';
@Injectable({
  providedIn: 'root',
})
export class User {
  constructor(private http: HttpClient) {}
  getAllUsers(): Observable<IUser> {
    return this.http.get<IUser>(environment.url + 'auth/GetAllUsersWithRoles');
  }
  addUser(data: IUser | any): Observable<string> {
    return this.http.post(environment.url + 'auth/SignUp', data, { responseType: 'text' });
  }
  deleteUser(userId: number): Observable<string> {
    return this.http.delete(environment.url + 'auth/DeleteUser/' + userId, {
      responseType: 'text',
    });
  }
}
