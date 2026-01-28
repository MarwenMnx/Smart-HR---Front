import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Observable, catchError, of, startWith } from 'rxjs';
import { AuthService, MeResponse } from '../../core/auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="bar">
      <div class="left">
        <strong class="brand">SmartHR</strong>

        <nav class="nav" *ngIf="isLoggedIn">
          <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
            Dashboard
          </a>
          <a routerLink="/employees" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
            Employees
          </a>
          <a routerLink="/employees/new" routerLinkActive="active">
            New Employee
          </a>
        </nav>
      </div>

      <div class="right" *ngIf="isLoggedIn">
        <ng-container *ngIf="me$ | async as me">
          <span class="user" *ngIf="me">{{ me.email }} · {{ me.role }}</span>
          <span class="user" *ngIf="!me" style="opacity:.7">Loading…</span>
        </ng-container>

        <button (click)="logout()">Logout</button>
      </div>
    </header>
  `,
  styles: [`
    .bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid rgba(0,0,0,0.12);
      font-family: system-ui;
    }

    .left { display: flex; align-items: center; gap: 16px; }
    .brand { font-size: 16px; }

    .nav { display: flex; gap: 10px; }
    .nav a {
      text-decoration: none;
      font-size: 14px;
      padding: 6px 10px;
      border-radius: 10px;
      color: inherit;
      opacity: 0.85;
    }
    .nav a.active {
      border: 1px solid rgba(0,0,0,0.15);
      opacity: 1;
      font-weight: 600;
    }

    .user {
      margin-right: 12px;
      font-size: 14px;
      opacity: 0.85;
    }

    button {
      padding: 6px 10px;
      border-radius: 8px;
      border: 0;
      cursor: pointer;
      font-weight: 600;
    }
  `],
})
export class Header {
  isLoggedIn = false;
  me$: Observable<MeResponse | null> = of(null);

  constructor(private auth: AuthService, private router: Router) {
    this.isLoggedIn = this.auth.isLoggedIn();

    this.me$ = this.isLoggedIn
      ? this.auth.me().pipe(
          startWith(null),
          catchError(() => of(null))
        )
      : of(null);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
