import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type DepartmentResponse = {
  id: number;
  name: string;
};

@Injectable({ providedIn: 'root' })
export class DepartmentsService {
  constructor(private http: HttpClient) {}

  list(): Observable<DepartmentResponse[]> {
    return this.http.get<DepartmentResponse[]>('/api/departments');
  }
}
