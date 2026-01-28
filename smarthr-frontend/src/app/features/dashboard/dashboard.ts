import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, startWith } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { Header } from '../layout/header';

type Vm =
  | { state: 'loading' }
  | { state: 'ok'; me: any }
  | { state: 'error'; message: string };

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, Header],
  template: `
    <app-header />

    <div style="max-width: 900px; margin: 40px auto; padding: 0 16px; font-family: system-ui;">
      <h2>Dashboard</h2>

      <ng-container *ngIf="vm$ | async as vm">
        <p *ngIf="vm.state === 'loading'">Loading /api/auth/me…</p>

        <div *ngIf="vm.state === 'ok'">
          <p><strong>/api/auth/me ✅</strong></p>
          <button (click)="reload()">Reload</button>

          <pre style="margin-top: 16px; white-space: pre-wrap;">{{ vm.me | json }}</pre>
        </div>

        <div *ngIf="vm.state === 'error'">
          <p style="color:#ff4d4f">{{ vm.message }}</p>
          <button (click)="reload()">Retry</button>
        </div>
      </ng-container>
    </div>
  `,
})
export class Dashboard {
  vm$!: Observable<Vm>;

  constructor(private auth: AuthService, private router: Router) {
    this.reload();
  }

  reload(): void {
    this.vm$ = this.auth.me().pipe(
      map((me) => ({ state: 'ok', me }) as Vm),
      startWith({ state: 'loading' } as Vm),
      catchError((e) => of({ state: 'error', message: this.errToMsg(e) } as Vm))
    );
  }

  private errToMsg(e: any): string {
    const msg = e?.error?.message || e?.error?.error || e?.message || 'Request failed';
    return typeof msg === 'string' ? msg : JSON.stringify(msg);
  }
}
