import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, catchError, forkJoin, map, of, startWith } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { AttendanceService } from '../../core/attendance/attendance.service';
import { PayrollService } from '../../core/payroll/payroll.service';
import { Header } from '../layout/header';

type Vm =
  | { state: 'loading' }
  | {
      state: 'ok';
      me: any;
      attendanceToday: { state: 'ok'; item: any } | { state: 'empty' };
      payrollThisMonth: { state: 'ok'; s: any } | { state: 'error'; message: string };
    }
  | { state: 'error'; message: string };

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, Header],
  template: `
    <app-header />

    <main class="page">
      <div class="container">
        <div class="pageHead">
          <div>
            <h1 class="title">Dashboard</h1>
            <p class="subtitle">Quick overview of your day and payroll</p>
          </div>

          <div class="headActions">
            <button class="btn btn-ghost" (click)="reload()">
              Reload
            </button>
          </div>
        </div>

        <ng-container *ngIf="vm$ | async as vm">
          <!-- Loading -->
          <div class="stateCard" *ngIf="vm.state === 'loading'">
            <div class="spinner" aria-hidden="true"></div>
            <div>
              <div class="stateTitle">Loading…</div>
              <div class="stateText">Fetching your latest data.</div>
            </div>
          </div>

          <!-- Error -->
          <div class="stateCard stateError" *ngIf="vm.state === 'error'">
            <div class="stateIcon" aria-hidden="true">!</div>
            <div class="stateBody">
              <div class="stateTitle">We couldn’t load the dashboard.</div>
              <div class="stateText">{{ vm.message }}</div>
              <div class="stateActions">
                <button class="btn btn-primary" (click)="reload()">Retry</button>
              </div>
            </div>
          </div>

          <!-- OK -->
          <div *ngIf="vm.state === 'ok'">
            <section class="grid">
              <!-- Attendance card -->
              <article class="card">
                <header class="cardHead">
                  <div class="cardTitleWrap">
                    <div class="cardIcon" aria-hidden="true">⏱</div>
                    <div>
                      <h2 class="cardTitle">Today Attendance</h2>
                      <p class="cardSub">Status of your workday</p>
                    </div>
                  </div>

                  <span
                    class="pill"
                    [class.pill-empty]="vm.attendanceToday.state === 'empty'"
                    [class.pill-ok]="vm.attendanceToday.state === 'ok'"
                  >
                    {{ vm.attendanceToday.state === 'empty' ? 'Not started' : 'Active' }}
                  </span>
                </header>

                <div class="divider"></div>

                <div class="cardBody">
                  <ng-container *ngIf="vm.attendanceToday.state === 'empty'">
                    <p class="muted" style="margin:0;">
                      No record yet. Go to Attendance to Clock In.
                    </p>
                  </ng-container>

                  <ng-container *ngIf="vm.attendanceToday.state === 'ok'">
                    <div class="kvGrid">
                      <div class="kv">
                        <div class="k">Date</div>
                        <div class="v">{{ vm.attendanceToday.item.workDate }}</div>
                      </div>

                      <div class="kv">
                        <div class="k">Worked</div>
                        <div class="v strong">{{ minsToHM(vm.attendanceToday.item.workedMinutes ?? 0) }}</div>
                      </div>

                      <div class="kv">
                        <div class="k">Check In</div>
                        <div class="v">{{ vm.attendanceToday.item.checkIn || '-' }}</div>
                      </div>

                      <div class="kv">
                        <div class="k">Check Out</div>
                        <div class="v">{{ vm.attendanceToday.item.checkOut || '-' }}</div>
                      </div>
                    </div>
                  </ng-container>
                </div>
              </article>

              <!-- Payroll card -->
              <article class="card">
                <header class="cardHead">
                  <div class="cardTitleWrap">
                    <div class="cardIcon" aria-hidden="true">💳</div>
                    <div>
                      <h2 class="cardTitle">This Month Payroll</h2>
                      <p class="cardSub">Summary for the current period</p>
                    </div>
                  </div>

                  <ng-container *ngIf="vm.payrollThisMonth.state === 'ok'">
                    <span class="pill pill-ok">
                      {{ vm.payrollThisMonth.s.year }}-{{ pad2(vm.payrollThisMonth.s.month) }}
                    </span>
                  </ng-container>

                  <ng-container *ngIf="vm.payrollThisMonth.state === 'error'">
                    <span class="pill pill-error">Unavailable</span>
                  </ng-container>
                </header>

                <div class="divider"></div>

                <div class="cardBody">
                  <ng-container *ngIf="vm.payrollThisMonth.state === 'error'">
                    <div class="inlineAlert">
                      <span class="inlineAlertIcon" aria-hidden="true">!</span>
                      <span class="inlineAlertText">{{ vm.payrollThisMonth.message }}</span>
                    </div>
                  </ng-container>

                  <ng-container *ngIf="vm.payrollThisMonth.state === 'ok'">
                    <div class="kvGrid">
                      <div class="kv">
                        <div class="k">Period</div>
                        <div class="v">{{ vm.payrollThisMonth.s.year }}-{{ pad2(vm.payrollThisMonth.s.month) }}</div>
                      </div>

                      <div class="kv">
                        <div class="k">Present days</div>
                        <div class="v">{{ vm.payrollThisMonth.s.presentDays }} / {{ vm.payrollThisMonth.s.workingDays }}</div>
                      </div>

                      <div class="kv kvWide">
                        <div class="k">Gross pay</div>
                        <div class="v money">{{ money(vm.payrollThisMonth.s.grossPay) }}</div>
                      </div>
                    </div>
                  </ng-container>
                </div>
              </article>
            </section>

            <!-- Debug -->
            <details class="debug">
              <summary>Debug: /api/auth/me JSON</summary>
              <pre>{{ vm.me | json }}</pre>
            </details>
          </div>
        </ng-container>
      </div>
    </main>
  `,
  styles: [`
    :host { display:block; }

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
      font-weight: 800;
      letter-spacing: -0.2px;
      color: #121C4E;
    }

    .subtitle {
      margin: 6px 0 0;
      font-size: 14px;
      color: rgba(0,0,0,0.65);
    }

    .headActions { display:flex; gap:10px; align-items:center; }

    /* Buttons (ADP-ish) */
    .btn {
      border: 1px solid transparent;
      border-radius: 12px;
      padding: 10px 14px;
      font-weight: 800;
      cursor: pointer;
      user-select: none;
      line-height: 1;
      font-size: 14px;
      transition: transform 0.02s ease, box-shadow 0.2s ease, background 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;
    }
    .btn:active { transform: translateY(1px); }
    .btn:disabled { opacity: 0.55; cursor: not-allowed; transform:none; }

    .btn-primary {
      background: #EE2722;
      color: #fff;
      box-shadow: 0 10px 18px rgba(238, 39, 34, 0.18);
    }
    .btn-primary:hover { box-shadow: 0 14px 24px rgba(238, 39, 34, 0.22); }

    .btn-ghost {
      background: transparent;
      color: #121C4E;
      border-color: rgba(18, 28, 78, 0.20);
    }
    .btn-ghost:hover { background: rgba(18, 28, 78, 0.04); }

    /* Grid */
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }

    @media (max-width: 860px) {
      .grid { grid-template-columns: 1fr; }
      .pageHead { flex-direction: column; align-items: stretch; }
      .headActions { justify-content: flex-start; }
    }

    /* Cards */
    .card {
      background: #fff;
      border: 1px solid rgba(0,0,0,0.08);
      border-radius: 16px;
      box-shadow: 0 8px 22px rgba(0,0,0,0.05);
      overflow: hidden;
    }

    .cardHead {
      padding: 16px;
      display:flex;
      align-items:flex-start;
      justify-content: space-between;
      gap: 12px;
    }

    .cardTitleWrap {
      display:flex;
      align-items:flex-start;
      gap: 10px;
    }

    .cardIcon {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      display:grid;
      place-items:center;
      background: rgba(18, 28, 78, 0.05);
      border: 1px solid rgba(18, 28, 78, 0.10);
      font-size: 16px;
    }

    .cardTitle {
      margin: 0;
      font-size: 16px;
      font-weight: 850;
      color: #121C4E;
    }

    .cardSub {
      margin: 4px 0 0;
      font-size: 12px;
      color: rgba(0,0,0,0.62);
    }

    .divider { height: 1px; background: rgba(0,0,0,0.08); }

    .cardBody { padding: 16px; }

    .muted { color: rgba(0,0,0,0.65); }

    /* Pills */
    .pill {
      display:inline-flex;
      align-items:center;
      padding: 6px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 850;
      border: 1px solid rgba(0,0,0,0.12);
      color: #121C4E;
      background: rgba(18, 28, 78, 0.04);
      white-space: nowrap;
    }
    .pill-ok { background: rgba(46, 125, 50, 0.08); border-color: rgba(46, 125, 50, 0.22); }
    .pill-empty { background: rgba(2, 136, 209, 0.08); border-color: rgba(2, 136, 209, 0.20); }
    .pill-error { background: rgba(211, 47, 47, 0.08); border-color: rgba(211, 47, 47, 0.22); color: #8b1c1c; }

    /* Key-value grid */
    .kvGrid {
      display:grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }
    .kv {
      border: 1px solid rgba(0,0,0,0.08);
      border-radius: 14px;
      padding: 12px;
      background: rgba(18, 28, 78, 0.02);
    }
    .kvWide { grid-column: 1 / -1; }
    .k {
      font-size: 12px;
      color: rgba(0,0,0,0.55);
      margin-bottom: 6px;
    }
    .v {
      font-size: 14px;
      font-weight: 850;
      color: #121C4E;
    }
    .v.strong { font-size: 15px; }
    .v.money { font-size: 18px; letter-spacing: -0.2px; }

    /* State cards */
    .stateCard {
      background: #fff;
      border: 1px solid rgba(0,0,0,0.08);
      border-radius: 16px;
      box-shadow: 0 8px 22px rgba(0,0,0,0.05);
      padding: 16px;
      display:flex;
      gap: 12px;
      align-items: flex-start;
    }
    .spinner {
      width: 18px;
      height: 18px;
      border-radius: 999px;
      border: 2px solid rgba(0,0,0,0.16);
      border-top-color: rgba(238, 39, 34, 0.8);
      animation: spin 0.9s linear infinite;
      margin-top: 2px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .stateError { border-color: rgba(211, 47, 47, 0.20); background: rgba(211, 47, 47, 0.03); }
    .stateIcon {
      width: 22px;
      height: 22px;
      border-radius: 7px;
      display:grid;
      place-items:center;
      font-weight: 900;
      color: #d32f2f;
      background: rgba(211, 47, 47, 0.12);
      border: 1px solid rgba(211, 47, 47, 0.18);
      margin-top: 1px;
    }
    .stateBody { display:grid; gap: 6px; }
    .stateTitle { font-weight: 900; color:#121C4E; }
    .stateText { font-size: 13px; color: rgba(0,0,0,0.72); white-space: pre-wrap; }
    .stateActions { margin-top: 4px; }

    /* Inline alert inside card */
    .inlineAlert {
      display:flex;
      gap: 10px;
      align-items:flex-start;
      border: 1px solid rgba(211, 47, 47, 0.18);
      background: rgba(211, 47, 47, 0.06);
      padding: 10px 12px;
      border-radius: 14px;
    }
    .inlineAlertIcon {
      width: 20px;
      height: 20px;
      border-radius: 6px;
      display:grid;
      place-items:center;
      font-weight: 900;
      color: #d32f2f;
      background: rgba(211, 47, 47, 0.14);
    }
    .inlineAlertText {
      font-size: 13px;
      color: rgba(0,0,0,0.78);
      white-space: pre-wrap;
    }

    /* Debug */
    .debug {
      margin-top: 14px;
      border: 1px solid rgba(0,0,0,0.08);
      border-radius: 16px;
      padding: 12px 14px;
      background: rgba(255,255,255,0.7);
    }
    .debug summary {
      cursor: pointer;
      color: rgba(0,0,0,0.70);
      font-weight: 700;
    }
    .debug pre {
      margin: 10px 0 0;
      white-space: pre-wrap;
      word-break: break-word;
      font-size: 12px;
      opacity: 0.9;
    }
  `],
})
export class Dashboard {
  vm$!: Observable<Vm>;

  constructor(
    private auth: AuthService,
    private attendance: AttendanceService,
    private payroll: PayrollService
  ) {
    this.reload();
  }

  reload(): void {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    this.vm$ = forkJoin({
      me: this.auth.me(),
      attendanceToday: this.attendance.today().pipe(
        map((item) => ({ state: 'ok', item } as const)),
        catchError((e) => {
          const msg = this.errToMsg(e);
          if (msg.toLowerCase().includes('no attendance record')) {
            return of({ state: 'empty' } as const);
          }
          // if some other error, still show empty to avoid breaking dashboard
          return of({ state: 'empty' } as const);
        })
      ),
      payrollThisMonth: this.payroll.mySummary(year, month).pipe(
        map((s) => ({ state: 'ok', s } as const)),
        catchError((e) => of({ state: 'error', message: this.errToMsg(e) } as const))
      ),
    }).pipe(
      map((x) => ({ state: 'ok', ...x } as Vm)),
      startWith({ state: 'loading' } as Vm),
      catchError((e) => of({ state: 'error', message: this.errToMsg(e) } as Vm))
    );
  }

  pad2(n: number): string {
    return String(n).padStart(2, '0');
  }

  minsToHM(mins: number): string {
    const m = Math.max(0, Number(mins) || 0);
    const h = Math.floor(m / 60);
    const r = m % 60;
    return `${h}h ${r}m`;
  }

  money(v: number): string {
    const n = Number(v);
    if (!Number.isFinite(n)) return String(v);
    return n.toFixed(2);
  }

  private errToMsg(e: any): string {
    const msg = e?.error?.message || e?.error?.error || e?.message || 'Request failed';
    return typeof msg === 'string' ? msg : JSON.stringify(msg);
  }
}
