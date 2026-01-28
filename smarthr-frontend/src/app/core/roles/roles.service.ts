import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type RoleResponse = {
  id: number;
  name: 'ADMIN' | 'HR' | 'EMPLOYEE' | string;
};

@Injectable({ providedIn: 'root' })
export class RolesService {
  constructor(private http: HttpClient) {}

  list(): Observable<RoleResponse[]> {
    return this.http.get<RoleResponse[]>('/api/roles');
  }
}
