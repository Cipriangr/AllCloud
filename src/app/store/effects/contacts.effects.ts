import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, exhaustMap, map, mergeMap } from 'rxjs/operators';
import { CoreService } from '../../core.service';
import { loadContacts, loadContactsSucces, loadContactsFailure, addContacts, uploadContactsSuccess, uploadContactsFailure } from '../actions/contacts.actions';

@Injectable()
export class ContactsEffects {

  constructor(
    private actions$: Actions,
    private coreService: CoreService
  ) {}

  loadContacts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadContacts),
      // used mergemap to combine all inner observables if executed in parallel
      mergeMap(() =>
        this.coreService.getContacts().pipe(
          map(contacts => loadContactsSucces({ contacts })),
          catchError(error => of(loadContactsFailure({ error })))
        )
      )
    )
  );

  addContacts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addContacts),
      //used exhaustMap to prevent multiple updateContacts actions from being processed simultaneously. only one update at a time
      exhaustMap(action => {
        return this.coreService.addNewContact(action.contacts).pipe(
          map(() => uploadContactsSuccess()),
          catchError(error => of(uploadContactsFailure({error: error.message})))
        )
      })
    ),
  )
}
