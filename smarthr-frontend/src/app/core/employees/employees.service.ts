import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type EmployeeResponse = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  hireDate: string; // LocalDate -> ISO string
  baseSalary: number;
  active: boolean;

  departmentId: number;
  departmentName: string;

  roleId: number;
  roleName: string;

  createdAt: string;
  updatedAt: string;
};

export type EmployeeCreateRequest = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  hireDate: string;      // "YYYY-MM-DD"
  baseSalary: number;
  departmentId: number;
  roleId: number;
};

@Injectable({ providedIn: 'root' })
export class EmployeesService {
  constructor(private http: HttpClient) {}

  list(): Observable<EmployeeResponse[]> {
    return this.http.get<EmployeeResponse[]>('/api/employees');
  }

  create(payload: EmployeeCreateRequest): Observable<EmployeeResponse> {
    return this.http.post<EmployeeResponse>('/api/employees', payload);
  }
}
