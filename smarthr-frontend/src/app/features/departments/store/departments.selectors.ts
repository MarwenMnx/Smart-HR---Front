import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  DEPARTMENTS_FEATURE_KEY,
  DepartmentsState,
  initialState,
} from './departments.reducer';

export const selectDepartmentsState =
  createFeatureSelector<DepartmentsState>(DEPARTMENTS_FEATURE_KEY);

const safe = (s: DepartmentsState | undefined) => s ?? initialState;

export const selectDepartmentsItems = createSelector(
  selectDepartmentsState,
  (s) => safe(s).items
);

export const selectDepartmentsLoading = createSelector(
  selectDepartmentsState,
  (s) => safe(s).loading
);

export const selectDepartmentsError = createSelector(
  selectDepartmentsState,
  (s) => safe(s).error
);

export const selectDepartmentsCreating = createSelector(
  selectDepartmentsState,
  (s) => safe(s).creating
);

export const selectDeletingIds = createSelector(
  selectDepartmentsState,
  (s) => safe(s).deletingIds
);
