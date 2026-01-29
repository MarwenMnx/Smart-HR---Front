import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { DepartmentResponse } from '../../../core/departments/departments.service';

export const DepartmentsActions = createActionGroup({
  source: 'Departments',
  events: {
    'Load': emptyProps(),
    'Load Success': props<{ items: DepartmentResponse[] }>(),
    'Load Failure': props<{ message: string }>(),

    'Create': props<{ name: string }>(),
    'Create Success': props<{ item: DepartmentResponse }>(),
    'Create Failure': props<{ message: string }>(),

    'Delete': props<{ id: number }>(),
    'Delete Success': props<{ id: number }>(),
    'Delete Failure': props<{ message: string }>(),
  },
});
