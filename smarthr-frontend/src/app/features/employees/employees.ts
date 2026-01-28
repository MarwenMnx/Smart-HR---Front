import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, startWith } from 'rxjs';
import { Header } from '../layout/header';
import { EmployeesService, EmployeeResponse } from '../../core/employees/employees.service';

type Vm =
  | { state: 'loading' }
  | { state: 'ok'; items: EmployeeResponse[] }
  | { state: 'error'; message: string };

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, Header],
  template: `
    <app-header />

    <main class="page">
      <div class="container">
        <div class="pageHead">
          <div>
            <h1 class="title">Employees</h1>
            <p class="subtitle">Browse employee directory</p>
          </div>

          <ng-container *ngIf="vm$ | async as vm">
            <span class="pill" *ngIf="vm.state === 'ok'">
              Total: {{ vm.items.length }}
            </span>
            <span class="pill pill-loading" *ngIf="vm.state === 'loading'">
              Loading…
            </span>
            <span class="pill pill-error" *ngIf="vm.state === 'error'">
              Error
            </span>
          </ng-container>
        </div>

        <ng-container *ngIf="vm$ | async as vm">
          <!-- Loading -->
          <div class="stateCard" *ngIf="vm.state === 'loading'">
            <div class="spinner" aria-hidden="true"></div>
            <div>
              <div class="stateTitle">Loading employees…</div>
              <div class="stateText">Fetching /api/employees</div>
            </div>
          </div>

          <!-- Error -->
          <div class="stateCard stateError" *ngIf="vm.state === 'error'">
            <div class="stateIcon" aria-hidden="true">!</div>
            <div class="stateBody">
              <div class="stateTitle">We couldn’t load employees.</div>
              <div class="stateText">{{ vm.message }}</div>
              <div class="stateActions">
                <button class="btn btn-primary" (click)="reload()">Retry</button>
              </div>
            </div>
          </div>

          <!-- OK -->
          <section class="card" *ngIf="vm.state === 'ok'">
            <div class="cardHead">
              <div class="cardTitleWrap">
                <div class="cardIcon" aria-hidden="true">🧑‍🤝‍🧑</div>
                <div>
                  <h2 class="cardTitle">Directory</h2>
                  <p class="cardSub">Click a row to open details</p>
                </div>
              </div>

              <button class="btn btn-ghost" (click)="reload()">Reload</button>
            </div>

            <div class="divider"></div>

            <div class="tableWrap">
              <table class="table">
                <thead>
                  <tr>
                    <th class="colId">ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Role</th>
                  </tr>
                </thead>

                <tbody>
                  <tr
                    class="row"
                    *ngFor="let e of vm.items"
                    (click)="goToDetails(e.id)"
                    tabindex="0"
                  >
                    <td class="mono">{{ e.id }}</td>

                    <td>
                      <div class="nameCell">
                        <span class="avatar" aria-hidden="true">
                          {{ (e.firstName || '?')[0] | uppercase }}{{ (e.lastName || '?')[0] | uppercase }}
                        </span>
                        <div class="nameText">
                          <div class="name">{{ e.firstName }} {{ e.lastName }}</div>
                          <div class="meta muted">{{ e.departmentName }} · {{ e.roleName }}</div>
                        </div>
                      </div>
                    </td>

                    <td class="email">{{ e.email }}</td>
                    <td>{{ e.departmentName }}</td>
                    <td>{{ e.roleName }}</td>
                  </tr>
                </tbody>
              </table>

              <div class="empty" *ngIf="vm.items.length === 0">
                No employees found.
              </div>
            </div>
          </section>
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

    .container { max-width: 1100px; margin: 0 auto; }

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
    .pill-error { background: rgba(211, 47, 47, 0.08); border-color: rgba(211, 47, 47, 0.22); color: #8b1c1c; }

    /* Buttons */
    .btn {
      border: 1px solid transparent;
      border-radius: 12px;
      padding: 10px 14px;
      font-weight: 900;
      cursor: pointer;
      user-select: none;
      line-height: 1;
      font-size: 14px;
      transition: transform 0.02s ease, box-shadow 0.2s ease, background 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;
      background: transparent;
      color: #121C4E;
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
      border-color: rgba(18, 28, 78, 0.20);
      background: transparent;
    }
    .btn-ghost:hover { background: rgba(18, 28, 78, 0.04); }

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

    /* Table */
    .tableWrap {
      overflow: auto;
    }

    .table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      min-width: 860px; /* keeps columns readable on desktop */
    }

    thead th {
      text-align: left;
      padding: 12px 14px;
      font-size: 12px;
      font-weight: 900;
      color: rgba(0,0,0,0.65);
      background: rgba(18, 28, 78, 0.02);
      border-bottom: 1px solid rgba(0,0,0,0.08);
      position: sticky;
      top: 0;
      z-index: 1;
    }

    tbody td {
      padding: 12px 14px;
      border-bottom: 1px solid rgba(0,0,0,0.06);
      font-size: 14px;
      color: rgba(0,0,0,0.82);
      vertical-align: middle;
    }

    .row {
      cursor: pointer;
      transition: background 0.15s ease;
      outline: none;
    }

    .row:hover {
      background: rgba(18, 28, 78, 0.03);
    }

    .row:focus-visible {
      box-shadow: inset 0 0 0 3px rgba(238, 39, 34, 0.18);
      background: rgba(238, 39, 34, 0.05);
    }

    .colId { width: 90px; }

    .mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      color: rgba(0,0,0,0.7);
    }

    .muted { color: rgba(0,0,0,0.62); }

    .nameCell {
      display:flex;
      align-items:center;
      gap: 10px;
      min-width: 0;
    }

    .avatar {
      width: 30px;
      height: 30px;
      border-radius: 12px;
      display:grid;
      place-items:center;
      font-weight: 900;
      font-size: 12px;
      color: #121C4E;
      background: rgba(18, 28, 78, 0.06);
      border: 1px solid rgba(18, 28, 78, 0.12);
      flex: 0 0 auto;
    }

    .nameText { min-width: 0; }
    .name {
      font-weight: 900;
      color: #121C4E;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 260px;
    }

    .meta {
      font-size: 12px;
      margin-top: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 260px;
    }

    .email {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 280px;
      color: rgba(0,0,0,0.78);
    }

    .empty {
      padding: 16px;
      color: rgba(0,0,0,0.65);
      font-size: 13px;
    }

    /* States */
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

    .stateError {
      border-color: rgba(211, 47, 47, 0.20);
      background: rgba(211, 47, 47, 0.03);
    }

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

    @media (max-width: 860px) {
      .table { min-width: 760px; }
      .pageHead { flex-direction: column; align-items: stretch; }
    }
  `],
})
export class Employees {
  vm$!: Observable<Vm>;

  constructor(private employees: EmployeesService, private router: Router) {
    this.reload();
  }

  reload(): void {
    this.vm$ = this.employees.list().pipe(
      map((items) => ({ state: 'ok', items } as Vm)),
      startWith({ state: 'loading' } as Vm),
      catchError((e) => of({ state: 'error', message: this.errToMsg(e) } as Vm))
    );
  }

  goToDetails(id: number): void {
    this.router.navigate(['/employees', id]);
  }

  private errToMsg(e: any): string {
    const msg = e?.error?.message || e?.error?.error || e?.message || 'Request failed';
    return typeof msg === 'string' ? msg : JSON.stringify(msg);
  }
}
