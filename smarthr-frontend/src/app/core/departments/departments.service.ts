import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type DepartmentResponse = {
  id: number;
  name: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type DepartmentCreateRequest = {
  name: string;
  description?: string | null;
};

@Injectable({ providedIn: 'root' })
export class DepartmentsService {
  constructor(private http: HttpClient) {}

  list(): Observable<DepartmentResponse[]> {
    return this.http.get<DepartmentResponse[]>('/api/departments');
  }

  create(body: DepartmentCreateRequest): Observable<DepartmentResponse> {
    return this.http.post<DepartmentResponse>('/api/departments', body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`/api/departments/${id}`);
  }
}
