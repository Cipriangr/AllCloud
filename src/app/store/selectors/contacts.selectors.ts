import { createFeatureSelector, createSelector } from "@ngrx/store";
import { ContactsState } from "../../interfaces";

export const selectContactState = createFeatureSelector<ContactsState>('contacts');
export const selectAllContacts = createSelector(
  selectContactState,
  (state: ContactsState) => state.contacts
);

export const selectUpdateContactsSuccess  = createSelector(
  selectContactState,
  (state: ContactsState) => state.successMessage
);

export const selectUpdateContactsError = createSelector(
  selectContactState,
  (state: ContactsState) => state.errorMessage
)