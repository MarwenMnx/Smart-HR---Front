import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, catchError, map, of, startWith } from 'rxjs';

import { Header } from '../layout/header';
import { PayrollService, PayrollSummaryResponse } from '../../core/payroll/payroll.service';

type Vm =
  | { state: 'idle' }
  | { state: 'loading' }
  | { state: 'ok'; s: PayrollSummaryResponse }
  | { state: 'error'; message: string };

@Component({
  selector: 'app-payroll',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Header],
  template: `
    <app-header />

    <main class="page">
      <div class="container">
        <div class="pageHead">
          <div>
            <h1 class="title">Payroll</h1>
            <p class="subtitle">View your monthly payroll summary</p>
          </div>

          <ng-container *ngIf="vm$ | async as vm">
            <span class="pill pill-loading" *ngIf="vm.state === 'loading'">Loading…</span>
            <span class="pill pill-error" *ngIf="vm.state === 'error'">Error</span>
            <span class="pill pill-ok" *ngIf="vm.state === 'ok'">
              {{ vm.s.year }}-{{ pad2(vm.s.month) }}
            </span>
          </ng-container>
        </div>

        <!-- Filter card -->
        <section class="card">
          <div class="cardHead">
            <div class="cardTitleWrap">
              <div class="cardIcon" aria-hidden="true">📅</div>
              <div>
                <h2 class="cardTitle">Select period</h2>
                <p class="cardSub">Choose a month to load your summary</p>
              </div>
            </div>
          </div>

          <div class="divider"></div>

          <div class="cardBody">
            <form class="formRow" [formGroup]="form" (ngSubmit)="load()">
              <div class="field">
                <label>Month</label>
                <input type="month" formControlName="ym" />
              </div>

              <button
                class="btn btn-primary"
                type="submit"
                [disabled]="form.invalid || (vm$ | async)?.state === 'loading'"
              >
                {{ (vm$ | async)?.state === 'loading' ? 'Loading…' : 'Load summary' }}
              </button>
            </form>

            <ng-container *ngIf="vm$ | async as vm">
              <p class="hint" *ngIf="vm.state === 'idle'">Pick a month and load your summary.</p>

              <div class="inlineAlert inlineAlertError" *ngIf="vm.state === 'error'">
                <span class="inlineIcon" aria-hidden="true">!</span>
                <span class="inlineText">{{ vm.message }}</span>
              </div>
            </ng-container>
          </div>
        </section>

        <!-- Summary card -->
        <ng-container *ngIf="vm$ | async as vm">
          <section class="card cardSpacing" *ngIf="vm.state === 'ok'">
            <div class="cardHead">
              <div class="cardTitleWrap">
                <div class="cardIcon" aria-hidden="true">💳</div>
                <div>
                  <h2 class="cardTitle">Summary</h2>
                  <p class="cardSub">Key totals for the selected month</p>
                </div>
              </div>

              <span class="pill pill-ok">
                {{ vm.s.year }}-{{ pad2(vm.s.month) }}
              </span>
            </div>

            <div class="divider"></div>

            <div class="cardBody">
              <div class="topLine">
                <div class="who">
                  <div class="whoLabel">Employee</div>
                  <div class="whoValue">
                    {{ vm.s.employeeEmail }}
                    <span class="muted">· ID</span>
                    <span class="mono">{{ vm.s.employeeId }}</span>
                  </div>
                </div>

                <div class="gross">
                  <div class="whoLabel">Gross pay</div>
                  <div class="grossValue">{{ money(vm.s.grossPay) }}</div>
                </div>
              </div>

              <div class="kvGrid">
                <div class="kv">
                  <div class="k">Base salary</div>
                  <div class="v">{{ money(vm.s.baseSalary) }}</div>
                </div>

                <div class="kv">
                  <div class="k">Daily rate</div>
                  <div class="v">{{ money(vm.s.dailyRate) }}</div>
                </div>

                <div class="kv">
                  <div class="k">Working days</div>
                  <div class="v">{{ vm.s.workingDays }}</div>
                </div>

                <div class="kv">
                  <div class="k">Present days</div>
                  <div class="v">{{ vm.s.presentDays }}</div>
                </div>

                <div class="kv">
                  <div class="k">Absent days</div>
                  <div class="v">{{ vm.s.absentDays }}</div>
                </div>

                <div class="kv">
                  <div class="k">Worked time</div>
                  <div class="v">
                    {{ minsToHM(vm.s.workedMinutes) }}
                    <span class="muted"> ({{ vm.s.workedMinutes }} min)</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Loading state card (keeps page stable) -->
          <div class="stateCard" *ngIf="vm.state === 'loading'">
            <div class="spinner" aria-hidden="true"></div>
            <div>
              <div class="stateTitle">Loading payroll summary…</div>
              <div class="stateText">This may take a moment.</div>
            </div>
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

    .container { max-width: 980px; margin: 0 auto; }

    .pageHead {
      display:flex;
      align-items:flex-start;
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

    /* Pills */
    .pill {
      display:inline-flex;
      align-items:center;
      padding: 6px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 900;
      border: 1px solid rgba(0,0,0,0.12);
      color: #121C4E;
      background: rgba(18, 28, 78, 0.04);
      white-space: nowrap;
      margin-top: 2px;
    }
    .pill-loading { background: rgba(0,0,0,0.04); }
    .pill-ok { background: rgba(46, 125, 50, 0.08); border-color: rgba(46, 125, 50, 0.22); }
    .pill-error { background: rgba(211, 47, 47, 0.08); border-color: rgba(211, 47, 47, 0.22); color: #8b1c1c; }

    /* Card */
    .card {
      background: #fff;
      border: 1px solid rgba(0,0,0,0.08);
      border-radius: 16px;
      box-shadow: 0 8px 22px rgba(0,0,0,0.05);
      overflow: hidden;
    }

    .cardSpacing { margin-top: 14px; }

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
      font-weight: 900;
      color: #121C4E;
    }

    .cardSub {
      margin: 4px 0 0;
      font-size: 12px;
      color: rgba(0,0,0,0.62);
    }

    .divider { height: 1px; background: rgba(0,0,0,0.08); }
    .cardBody { padding: 16px; }

    /* Form row */
    .formRow {
      display:flex;
      gap: 12px;
      align-items: end;
      flex-wrap: wrap;
    }

    .field { display:grid; gap: 7px; }
    label {
      font-size: 13px;
      font-weight: 800;
      color: rgba(0,0,0,0.72);
    }

    input {
      padding: 11px 12px;
      border-radius: 12px;
      border: 1px solid rgba(18, 28, 78, 0.18);
      outline: none;
      background: #fff;
      font-size: 14px;
      transition: box-shadow 0.2s ease, border-color 0.2s ease;
      min-width: 220px;
    }

    input:focus {
      border-color: rgba(238, 39, 34, 0.55);
      box-shadow: 0 0 0 4px rgba(238, 39, 34, 0.12);
    }

    /* Buttons */
    .btn {
      border: 1px solid transparent;
      border-radius: 12px;
      padding: 11px 14px;
      font-weight: 900;
      cursor: pointer;
      user-select: none;
      line-height: 1;
      font-size: 14px;
      transition: transform 0.02s ease, box-shadow 0.2s ease, opacity 0.2s ease;
    }
    .btn:active { transform: translateY(1px); }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; transform:none; }

    .btn-primary {
      background: #EE2722;
      color: #fff;
      box-shadow: 0 10px 18px rgba(238, 39, 34, 0.18);
    }
    .btn-primary:hover:not(:disabled) { box-shadow: 0 14px 24px rgba(238, 39, 34, 0.22); }

    .hint {
      margin: 12px 0 0;
      font-size: 13px;
      color: rgba(0,0,0,0.65);
    }

    /* Inline alert */
    .inlineAlert {
      margin-top: 12px;
      display:flex;
      gap: 10px;
      align-items:flex-start;
      border-radius: 14px;
      padding: 10px 12px;
      border: 1px solid rgba(0,0,0,0.10);
      background: #fff;
    }

    .inlineIcon {
      width: 20px;
      height: 20px;
      border-radius: 6px;
      display:grid;
      place-items:center;
      font-weight: 900;
    }

    .inlineText { font-size: 13px; color: rgba(0,0,0,0.78); white-space: pre-wrap; }

    .inlineAlertError {
      background: rgba(211, 47, 47, 0.06);
      border-color: rgba(211, 47, 47, 0.18);
    }
    .inlineAlertError .inlineIcon {
      color: #d32f2f;
      background: rgba(211, 47, 47, 0.14);
      border: 1px solid rgba(211, 47, 47, 0.18);
    }

    /* Summary layout */
    .topLine {
      display:flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }

    .whoLabel {
      font-size: 12px;
      color: rgba(0,0,0,0.55);
      margin-bottom: 6px;
      font-weight: 800;
    }

    .whoValue {
      font-size: 14px;
      font-weight: 900;
      color: #121C4E;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 520px;
    }

    .grossValue {
      font-size: 20px;
      font-weight: 950;
      letter-spacing: -0.2px;
      color: #121C4E;
    }

    .muted { color: rgba(0,0,0,0.62); }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }

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

    .k {
      font-size: 12px;
      color: rgba(0,0,0,0.55);
      margin-bottom: 6px;
      font-weight: 800;
    }

    .v {
      font-size: 14px;
      font-weight: 900;
      color: #121C4E;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Loading card */
    .stateCard {
      margin-top: 14px;
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

    .stateTitle { font-weight: 900; color:#121C4E; }
    .stateText { font-size: 13px; color: rgba(0,0,0,0.72); }

    @media (max-width: 860px) {
      .kvGrid { grid-template-columns: 1fr; }
      input { min-width: 180px; }
      .pageHead { flex-direction: column; align-items: stretch; }
    }
  `],
})
export class Payroll {
  vm$: Observable<Vm> = of({ state: 'idle' });

  form;

  constructor(private fb: FormBuilder, private payroll: PayrollService) {
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    this.form = this.fb.group({
      ym: [ym, [Validators.required]],
    });
  }

  load(): void {
    if (this.form.invalid) return;

    const ym = String(this.form.getRawValue().ym || '');
    const [yStr, mStr] = ym.split('-');
    const year = Number(yStr);
    const month = Number(mStr);

    this.vm$ = this.payroll.mySummary(year, month).pipe(
      map((s) => ({ state: 'ok', s } as Vm)),
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
