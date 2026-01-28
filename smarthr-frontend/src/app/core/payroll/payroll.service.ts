import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type PayrollSummaryResponse = {
  year: number;
  month: number;

  employeeId: number;
  employeeEmail: string;

  baseSalary: number;     // BigDecimal -> number
  workingDays: number;
  presentDays: number;
  absentDays: number;
  workedMinutes: number;

  dailyRate: number;      // BigDecimal -> number
  grossPay: number;       // BigDecimal -> number
};

@Injectable({ providedIn: 'root' })
export class PayrollService {
  constructor(private http: HttpClient) {}

  mySummary(year: number, month: number): Observable<PayrollSummaryResponse> {
    return this.http.get<PayrollSummaryResponse>(`/api/payroll/me/summary?year=${year}&month=${month}`);
  }
}
