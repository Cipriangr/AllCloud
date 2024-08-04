import { createAction, props } from "@ngrx/store";
import { ContactType } from "../../interfaces";

export const loadContacts = createAction('[Contacts] Load Contacts from DB');

export const loadContactsSucces = createAction('[Contacts] Load Contacts Success', props<{contacts: ContactType[]}> ());

export const loadContactsFailure = createAction('[Contacts] Load Contacts Failure',
  props<{ error: any }>()
);

export const addContacts = createAction('[Contacts] add Contacts',
  props<{contacts: ContactType[]}> ()
);

export const uploadContactsSuccess = createAction('[Contacts] Upload Contacts Success');

export const uploadContactsFailure = createAction('[Contacts] Upload Contacts Failure',
  props<{ error: any }>()
);

export const clearSuccessMessage = createAction('[Contacts] Clear Success Message');
export const clearErrorMessage = createAction('[Contacts] Clear Error Message');