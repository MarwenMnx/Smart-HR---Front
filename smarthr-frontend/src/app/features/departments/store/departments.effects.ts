import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { DepartmentsService } from '../../../core/departments/departments.service';
import { DepartmentsActions } from './departments.actions';

@Injectable()
export class DepartmentsEffects {
  private actions$ = inject(Actions);
  private api = inject(DepartmentsService);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DepartmentsActions.load),
      switchMap(() =>
        this.api.list().pipe(
          map((items) => DepartmentsActions.loadSuccess({ items })),
          catchError((e) => of(DepartmentsActions.loadFailure({ message: this.errToMsg(e) })))
        )
      )
    )
  );

  create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DepartmentsActions.create),
      switchMap(({ name }) =>
        this.api.create({ name }).pipe(
          map((item) => DepartmentsActions.createSuccess({ item })),
          catchError((e) => of(DepartmentsActions.createFailure({ message: this.errToMsg(e) })))
        )
      )
    )
  );

  delete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DepartmentsActions.delete),
      switchMap(({ id }) =>
        this.api.delete(id).pipe(
          map(() => DepartmentsActions.deleteSuccess({ id })),
          catchError((e) => of(DepartmentsActions.deleteFailure({ message: this.errToMsg(e) })))
        )
      )
    )
  );

  private errToMsg(e: any): string {
    const msg = e?.error?.message || e?.error?.error || e?.message || 'Request failed';
    return typeof msg === 'string' ? msg : JSON.stringify(msg);
  }
}
