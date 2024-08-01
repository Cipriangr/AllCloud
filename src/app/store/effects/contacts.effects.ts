import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, exhaustMap, map, mergeMap } from 'rxjs/operators';
import { BackendService } from '../../core.service';
import { loadContacts, loadContactsSucces, loadContactsFailure, updateContacts, uploadContactsSuccess, uploadContactsFailure } from '../actions/contacts.actions';
import { ContactType } from '../../interfaces';

@Injectable()
export class ContactsEffects {

  constructor(
    private actions$: Actions,
    private backendService: BackendService
  ) {}

  loadContacts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadContacts),
      mergeMap(() =>
        this.backendService.getContacts().pipe(
          map(contacts => loadContactsSucces({ contacts })),
          catchError(error => of(loadContactsFailure({ error })))
        )
      )
    )
  );

  updateContacts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateContacts),
      exhaustMap(action => {
        return this.backendService.addNewContact(action.contacts).pipe(
          map(() => uploadContactsSuccess()),
          catchError(error => of(uploadContactsFailure({error: error.message})))
        )
      })
    ),
  )
}
