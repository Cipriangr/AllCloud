import { createReducer, on } from '@ngrx/store';
import { clearErrorMessage, clearSuccessMessage, loadContacts, loadContactsFailure, loadContactsSucces, addContacts, uploadContactsFailure, uploadContactsSuccess } from './actions/contacts.actions';
import { ContactsState } from '../interfaces';

export const initialContactState: ContactsState = {
  contacts: [],
  // error null helps reset any previous error state from previous actions. 
  // is useful for indicating that a new attempt is being made and no error should be displayed from previous attempts.
  //i will use memoization by creating selectors
  successMessage: null,
  errorMessage: null
};

export const contactsReducer = createReducer(
  initialContactState,
  on(addContacts, (state, { contacts }) => ({
    ...state,
    contacts: [...state.contacts, ...contacts]
  })),
  on(loadContacts, state => ({
    ...state, error: null
  })),
  on(loadContactsSucces, (state, { contacts }) => ({
    ...state, contacts
  })),
  on(loadContactsFailure, (state, { error }) => ({
    ...state,
    error
  })),
  on(uploadContactsSuccess, (state) => ({
    ...state,
    successMessage: 'Added successfully!',
    errorMessage: null,
  })),
  on(uploadContactsFailure, (state, { error }) => ({
    ...state,
    successMessage: null,
    errorMessage: error,
  })),
  on(clearSuccessMessage, (state) => ({
    ...state,
    successMessage: null
  })),
  on(clearErrorMessage, (state) => ({
    ...state,
    errorMessage: null
  })),
);
