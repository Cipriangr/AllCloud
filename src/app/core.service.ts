import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ContactType, ApiResponseType, FetchedContactType } from './interfaces';
import { BehaviorSubject, catchError, concatMap, EMPTY, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { Store } from '@ngrx/store';
import { addContacts } from './store/actions/contacts.actions';

@Injectable({
  providedIn: 'root'
})
export class CoreService {

  baseServerUrl = 'http://localhost:3000';
  contactsSubject = new BehaviorSubject<ContactType[]>([]);
  contactsObservable$ = this.contactsSubject.asObservable();
  deleteSubject$ = new BehaviorSubject<string>('');
  deleteObservable$ = this.deleteSubject$.asObservable();
  contactEditSubject$ = new BehaviorSubject<string>('');
  contactEditObservable$ = this.contactEditSubject$.asObservable();
  contactCache = new Map<number, ContactType>();

  constructor(private httpClient: HttpClient, private store: Store<{newContact: ContactType}>, ) { }

  getContacts(): Observable<ContactType[]> {
    return this.httpClient.get<ContactType[]>(`${this.baseServerUrl}/users`).pipe(
      tap(contacts => {
        this.setContactsInCache(contacts) 
      }),
      catchError(error => {
        console.error('Error fetching contacts:', error);
        return throwError(() => new Error('Error fetching contacts'));
      })
    );
  }

  fetchAndCacheContactById(contactId: number): Observable<ContactType> {
    return this.getContacts().pipe(
      concatMap(() => this.getCachedContactById(contactId)),
      catchError(error => {
        console.error('Error in fetchAndCacheContactById:', error);
        return of();
      })
    );
  }

  setContactsInCache(contacts: ContactType[]): void {
    this.contactsSubject.next(contacts);
    contacts.forEach(contact => this.contactCache.set(contact.id, contact));
  }

  getCachedContactById(id: number): Observable<ContactType> {
    const contact = this.contactCache.get(Number(id));
    if (contact) {
      return of(contact);
    }
    return EMPTY;
  }

  loadContactById(id: string): Observable<ContactType> {
    return this.httpClient.get<ContactType>(`${this.baseServerUrl}/users/${id}`);
  }

  addNewContact(contacts: ContactType[]): Observable<ContactType[]> {
    return this.httpClient.post<any>(`${this.baseServerUrl}/upload`, contacts, {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(
      map(response => {
        return response.message;
      }),
      tap(() => {        
        this.setContactsInCache([...this.contactsSubject.getValue(), ...contacts]);
      }),
      catchError(error => {
        return throwError(() => new Error(error.error.errorMessage))
      })
    )
  }

  updateExistingContact(contact: ContactType): Observable<string> {
    const url = `${this.baseServerUrl}/users/${contact.id}`;
    return this.httpClient.put<any>(url, contact, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(
      map(response => response.message),
      tap(() => {
        this.editContactFromCache(contact);
      }),
      catchError(error => throwError(() => new Error(error.error.errorMessage || 'Unknown error')))
    );
  }

  deleteContact(id: number): Observable<number> {
    return this.httpClient.delete<number>(`${this.baseServerUrl}/users/${id}`).pipe(
      tap(() => {
        this.removeContactFromCache(id);
      }),
      catchError(error => {
        return throwError(() => new Error(error.error.errorMessage));
      })
    )
  }

  removeContactFromCache(id: number): void {
    this.contactCache.delete(id);
    const currentContacts = this.contactsSubject.getValue();
    const updatedContacts = currentContacts.filter(contact => contact.id !== id);
    this.contactsSubject.next(updatedContacts);
  }

  editContactFromCache(editedContact: ContactType): void {
    const contacts = this.contactsSubject.getValue();
    const updatedContacts = contacts.map(oldContact => oldContact.id === editedContact.id ? editedContact: oldContact)
    this.setContactsInCache(updatedContacts);
  }

  deleteMessage(text: string): void {
    this.deleteSubject$.next(text);
  }

  contactEditMessage(text: string): void {
    this.contactEditSubject$.next(text);
  }

  resetMessages(): void {
    this.deleteSubject$.next('');
    this.contactEditSubject$.next('');
  }

  getNewContactData(requests: number) {
    return this.httpClient.get<ApiResponseType>(`https://randomuser.me/api/?results=${requests}`).pipe(
      map((data: ApiResponseType) => data.results),
    )
  }

  assignOrConvertId(id?: string|undefined): number {
    if (!id) {
      const assignId = Math.floor(Math.random() * 100000);
      return assignId;
    }
    return parseInt(id);
  }

  storeNewContacts(newContacts: FetchedContactType[]): void {
    const processedContacts = this.convertContacts(newContacts);
    //I could better call this.addcontacts, but I wanted to keep NGRX because I implemented it in the beginning for practic purposes.
    this.store.dispatch(addContacts({contacts: processedContacts}));
  }

  convertContacts(contacts: FetchedContactType[]): ContactType[] {
    return contacts.map((contact: FetchedContactType) => ({
      //Sometimes API is sending id.value as undefined so i will generate random ID for this case even if ID can be duplicated.
      //Anyway, I think the best solution would be to use Set for not having duplicates values.
      //I will improve it if I have time as the last task 
      id: this.assignOrConvertId(contact.id.value),
      lastName: contact.name.last,
      email: contact.email,
      firstName: contact.name.first,
      title: contact.name.title,
      age: contact.dob.age,
      large: contact.picture.large,
      medium: contact.picture.medium,
      thumbnail: contact.picture.thumbnail,
      gender: contact.gender,
      phone: contact.phone 
    }));
  }

}
