import { createReducer, on } from '@ngrx/store';
import { DepartmentsActions } from './departments.actions';
import { DepartmentResponse } from '../../../core/departments/departments.service';

export const DEPARTMENTS_FEATURE_KEY = 'departments';

export type DepartmentsState = {
  items: DepartmentResponse[];
  loading: boolean;
  error: string;
  creating: boolean;
  deletingIds: Record<number, boolean>;
};

export const initialState: DepartmentsState = {
  items: [],
  loading: false,
  error: '',
  creating: false,
  deletingIds: {},
};

export const departmentsReducer = createReducer(
  initialState,

  on(DepartmentsActions.load, (s) => ({ ...s, loading: true, error: '' })),
  on(DepartmentsActions.loadSuccess, (s, { items }) => ({ ...s, loading: false, items })),
  on(DepartmentsActions.loadFailure, (s, { message }) => ({ ...s, loading: false, error: message })),

  on(DepartmentsActions.create, (s) => ({ ...s, creating: true, error: '' })),
  on(DepartmentsActions.createSuccess, (s, { item }) => ({
    ...s,
    creating: false,
    items: [item, ...s.items],
  })),
  on(DepartmentsActions.createFailure, (s, { message }) => ({ ...s, creating: false, error: message })),

  on(DepartmentsActions.delete, (s, { id }) => ({
    ...s,
    deletingIds: { ...s.deletingIds, [id]: true },
    error: '',
  })),
  on(DepartmentsActions.deleteSuccess, (s, { id }) => {
    const { [id]: _removed, ...rest } = s.deletingIds;
    return { ...s, deletingIds: rest, items: s.items.filter((d) => d.id !== id) };
  }),
  on(DepartmentsActions.deleteFailure, (s, { message }) => ({ ...s, error: message, deletingIds: {} }))
);
