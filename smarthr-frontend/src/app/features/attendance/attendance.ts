import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, catchError, map, of, startWith } from 'rxjs';
import { Header } from '../layout/header';
import { AttendanceService, AttendanceResponse } from '../../core/attendance/attendance.service';

type Vm =
  | { state: 'loading' }
  | { state: 'ok'; item: AttendanceResponse }
  | { state: 'empty' } // no record today
  | { state: 'error'; message: string };

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, Header],
  template: `
    <app-header />

    <main class="page">
      <div class="container">
        <div class="pageHead">
          <div>
            <h1 class="title">Attendance</h1>
            <p class="subtitle">Clock in/out and view today’s record</p>
          </div>

          <button class="btn btn-ghost" (click)="reload()" [disabled]="clockInLoading || clockOutLoading">
            Reload
          </button>
        </div>

        <ng-container *ngIf="vm$ | async as vm">
          <!-- Action messages -->
          <div class="alerts" *ngIf="actionMsg || actionError">
            <div class="alert alert-success" *ngIf="actionMsg">
              <span class="alertIcon">✓</span>
              <span>{{ actionMsg }}</span>
            </div>

            <div class="alert alert-error" *ngIf="actionError">
              <span class="alertIcon">!</span>
              <span>{{ actionError }}</span>
            </div>
          </div>

          <!-- Main card -->
          <section class="card">
            <div class="cardHead">
              <div class="status">
                <span
                  class="pill"
                  [class.pill-loading]="vm.state === 'loading'"
                  [class.pill-ok]="vm.state === 'ok'"
                  [class.pill-empty]="vm.state === 'empty'"
                  [class.pill-error]="vm.state === 'error'"
                >
                  <ng-container [ngSwitch]="vm.state">
                    <span *ngSwitchCase="'loading'">Loading</span>
                    <span *ngSwitchCase="'ok'">Active record</span>
                    <span *ngSwitchCase="'empty'">Not started</span>
                    <span *ngSwitchCase="'error'">Error</span>
                  </ng-container>
                </span>

                <span class="statusText" *ngIf="vm.state === 'empty'">
                  No record yet — clock in to start.
                </span>
                <span class="statusText" *ngIf="vm.state === 'loading'">
                  Fetching today’s attendance…
                </span>
                <span class="statusText" *ngIf="vm.state === 'ok'">
                  Your attendance is up to date.
                </span>
                <span class="statusText statusTextError" *ngIf="vm.state === 'error'">
                  {{ vm.message }}
                </span>
              </div>

              <div class="actions">
                <button class="btn btn-primary" (click)="doClockIn()" [disabled]="!canClockIn(vm)">
                  {{ clockInLoading ? 'Clocking in…' : 'Clock In' }}
                </button>

                <button class="btn btn-secondary" (click)="doClockOut()" [disabled]="!canClockOut(vm)">
                  {{ clockOutLoading ? 'Clocking out…' : 'Clock Out' }}
                </button>
              </div>
            </div>

            <div class="divider"></div>

            <!-- Content states -->
            <div class="cardBody">
              <p class="muted" *ngIf="vm.state === 'loading'">Loading today…</p>

              <div *ngIf="vm.state === 'empty'" class="empty">
                <p class="emptyTitle">No attendance record for today.</p>
                <p class="muted">
                  Click <b>Clock In</b> to start tracking your workday.
                </p>
              </div>

              <div *ngIf="vm.state === 'ok'" class="grid">
                <div class="kv">
                  <div class="k">Date</div>
                  <div class="v">{{ vm.item.workDate }}</div>
                </div>

                <div class="kv">
                  <div class="k">Check In</div>
                  <div class="v">{{ vm.item.checkIn || '-' }}</div>
                </div>

                <div class="kv">
                  <div class="k">Check Out</div>
                  <div class="v">{{ vm.item.checkOut || '-' }}</div>
                </div>

                <div class="kv">
                  <div class="k">Worked minutes</div>
                  <div class="v">{{ vm.item.workedMinutes ?? 0 }}</div>
                </div>
              </div>
            </div>
          </section>
        </ng-container>
      </div>
    </main>
  `,
  styles: [`
    :host { display: block; }

    /* Page */
    .page {
      background: #f6f7fb;
      padding: 28px 16px 48px;
      min-height: calc(100vh - 64px);
      font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
    }

    .container {
      max-width: 980px;
      margin: 0 auto;
    }

    /* Header */
    .pageHead {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 14px;
    }

    .title {
      margin: 0;
      font-size: 26px;
      font-weight: 760;
      letter-spacing: -0.2px;
      color: #121C4E; /* deep enterprise navy */
    }

    .subtitle {
      margin: 6px 0 0;
      font-size: 14px;
      color: rgba(0,0,0,0.65);
    }

    /* Card */
    .card {
      background: #fff;
      border: 1px solid rgba(0,0,0,0.08);
      border-radius: 16px;
      box-shadow: 0 8px 22px rgba(0,0,0,0.05);
      overflow: hidden;
    }

    .cardHead {
      padding: 16px;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
    }

    .divider {
      height: 1px;
      background: rgba(0,0,0,0.08);
    }

    .cardBody {
      padding: 16px;
    }

    /* Status */
    .status {
      display: grid;
      gap: 10px;
      max-width: 520px;
    }

    .pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 750;
      border: 1px solid rgba(0,0,0,0.12);
      width: fit-content;
      color: #121C4E;
      background: rgba(18, 28, 78, 0.04);
    }

    .pill-loading { background: rgba(0,0,0,0.04); }
    .pill-ok { background: rgba(46, 125, 50, 0.08); border-color: rgba(46, 125, 50, 0.22); }
    .pill-empty { background: rgba(2, 136, 209, 0.08); border-color: rgba(2, 136, 209, 0.20); }
    .pill-error { background: rgba(211, 47, 47, 0.08); border-color: rgba(211, 47, 47, 0.22); }

    .statusText {
      font-size: 13px;
      color: rgba(0,0,0,0.65);
      line-height: 1.35;
    }

    .statusTextError {
      color: #d32f2f;
      white-space: pre-wrap;
    }

    .muted {
      color: rgba(0,0,0,0.65);
      margin: 0;
    }

    /* Actions */
    .actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: flex-end;
      align-items: center;
      min-width: 260px;
    }

    .btn {
      border: 1px solid transparent;
      border-radius: 12px;
      padding: 10px 14px;
      font-weight: 750;
      cursor: pointer;
      transition: transform 0.02s ease, box-shadow 0.2s ease, background 0.2s ease, border-color 0.2s ease;
      user-select: none;
      line-height: 1;
      font-size: 14px;
    }

    .btn:active { transform: translateY(1px); }
    .btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

    /* ADP-ish primary red */
    .btn-primary {
      background: #EE2722;
      color: #fff;
      box-shadow: 0 10px 18px rgba(238, 39, 34, 0.18);
    }
    .btn-primary:hover:not(:disabled) { box-shadow: 0 14px 24px rgba(238, 39, 34, 0.22); }

    .btn-secondary {
      background: #fff;
      color: #121C4E;
      border-color: rgba(18, 28, 78, 0.22);
    }
    .btn-secondary:hover:not(:disabled) { background: rgba(18, 28, 78, 0.04); }

    .btn-ghost {
      background: transparent;
      color: #121C4E;
      border-color: rgba(18, 28, 78, 0.20);
    }
    .btn-ghost:hover:not(:disabled) { background: rgba(18, 28, 78, 0.04); }

    /* Alerts */
    .alerts {
      display: grid;
      gap: 10px;
      margin-bottom: 12px;
    }

    .alert {
      border-radius: 14px;
      padding: 10px 12px;
      border: 1px solid rgba(0,0,0,0.10);
      background: #fff;
      display: grid;
      grid-template-columns: 20px 1fr;
      gap: 10px;
      align-items: center;
      font-size: 13px;
    }

    .alertIcon {
      width: 20px;
      height: 20px;
      border-radius: 6px;
      display: grid;
      place-items: center;
      font-weight: 900;
      font-size: 13px;
    }

    .alert-success {
      background: rgba(46, 125, 50, 0.06);
      border-color: rgba(46, 125, 50, 0.20);
    }
    .alert-success .alertIcon {
      background: rgba(46, 125, 50, 0.14);
      color: #2e7d32;
    }

    .alert-error {
      background: rgba(211, 47, 47, 0.06);
      border-color: rgba(211, 47, 47, 0.20);
    }
    .alert-error .alertIcon {
      background: rgba(211, 47, 47, 0.14);
      color: #d32f2f;
    }

    /* Data grid */
    .grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
    }

    .kv {
      border: 1px solid rgba(0,0,0,0.08);
      border-radius: 14px;
      padding: 12px;
      background: rgba(18, 28, 78, 0.02);
    }

    .k {
      font-size: 12px;
      color: rgba(0,0,0,0.55);
      margin-bottom: 6px;
    }

    .v {
      font-size: 15px;
      font-weight: 800;
      color: #121C4E;
    }

    .emptyTitle {
      margin: 0 0 6px;
      font-weight: 800;
      color: #121C4E;
    }

    @media (max-width: 720px) {
      .pageHead { flex-direction: column; align-items: stretch; }
      .actions { justify-content: flex-start; min-width: auto; }
      .grid { grid-template-columns: 1fr; }
    }
  `],
})
export class Attendance {
  vm$!: Observable<Vm>;

  clockInLoading = false;
  clockOutLoading = false;

  actionMsg = '';
  actionError = '';

  constructor(private attendance: AttendanceService) {
    this.reload();
  }

  reload(): void {
    this.vm$ = this.attendance.today().pipe(
      map((item) => ({ state: 'ok', item } as Vm)),
      startWith({ state: 'loading' } as Vm),
      catchError((e) => {
        const msg = this.errToMsg(e);
        if (msg.toLowerCase().includes('no attendance record')) {
          return of({ state: 'empty' } as Vm);
        }
        return of({ state: 'error', message: msg } as Vm);
      })
    );
  }

  canClockIn(vm: Vm): boolean {
    if (this.clockInLoading || this.clockOutLoading) return false;
    if (vm.state === 'empty') return true;
    if (vm.state !== 'ok') return false;

    // can clock in only if no checkIn yet
    return !vm.item.checkIn;
  }

  canClockOut(vm: Vm): boolean {
    if (this.clockInLoading || this.clockOutLoading) return false;
    if (vm.state !== 'ok') return false;

    // can clock out only if checked in and not checked out
    return !!vm.item.checkIn && !vm.item.checkOut;
  }

  doClockIn(): void {
    this.clockInLoading = true;
    this.actionMsg = '';
    this.actionError = '';

    this.attendance.clockIn().subscribe({
      next: () => {
        this.clockInLoading = false;
        this.actionMsg = 'Clock-in done ✅';
        this.reload();
      },
      error: (e) => {
        this.clockInLoading = false;
        this.actionError = this.errToMsg(e);
        this.reload();
      },
    });
  }

  doClockOut(): void {
    this.clockOutLoading = true;
    this.actionMsg = '';
    this.actionError = '';

    this.attendance.clockOut().subscribe({
      next: () => {
        this.clockOutLoading = false;
        this.actionMsg = 'Clock-out done ✅';
        this.reload();
      },
      error: (e) => {
        this.clockOutLoading = false;
        this.actionError = this.errToMsg(e);
        this.reload();
      },
    });
  }

  private errToMsg(e: any): string {
    const msg = e?.error?.message || e?.error?.error || e?.message || 'Request failed';
    return typeof msg === 'string' ? msg : JSON.stringify(msg);
  }
}
