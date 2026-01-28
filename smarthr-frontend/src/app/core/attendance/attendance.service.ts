import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type AttendanceResponse = {
  id: number;
  employeeId: number;
  workDate: string;      // LocalDate -> "YYYY-MM-DD"
  checkIn?: string | null;
  checkOut?: string | null;
  workedMinutes?: number;
};

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  constructor(private http: HttpClient) {}

  clockIn(): Observable<AttendanceResponse> {
    return this.http.post<AttendanceResponse>('/api/attendance/me/clock-in', {});
  }

  clockOut(): Observable<AttendanceResponse> {
    return this.http.post<AttendanceResponse>('/api/attendance/me/clock-out', {});
  }

  today(): Observable<AttendanceResponse> {
    return this.http.get<AttendanceResponse>('/api/attendance/me/today');
  }
}
