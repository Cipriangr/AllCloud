import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ContactType, ApiResponseType, FetchedContactType, RequestType, RequestPayload } from './interfaces';
import { BehaviorSubject, catchError, EMPTY, map, Observable, of, Subject, switchMap, tap, throwError } from 'rxjs';
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
      switchMap(() => this.getCachedContactById(contactId)),
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

  // loadContactByIdWithCache(id: number): Observable<ContactType> {
  //   console.log('!!idWAZZZ', id);
  //   const cachedContact = this.getCachedContactById(Number(id));
  //   if (cachedContact) {
  //     console.log('Contact found in cache:', cachedContact);
  //     return cachedContact;
  //   }
  //   console.log('Contact not found in cache, fetching from server:', id);
  //   return this.loadContactById(id.toString()).pipe(
  //       tap(contact => {
  //           this.contactCache.set(contact.id, contact);
  //           console.log('Contact fetched and cached:', contact);
  //       })
  //   );
  // }

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

  //implemented behavioursubject for learning purposes which can be used as loadContact effect I keep ngrx to handle this for now
  // loadContactsAsObservable(): Observable<ContactType[]> {
  //   return this.getContacts();
  // }

  addNewContact(contacts: ContactType[]): Observable<ContactType[]> {
    return this.httpClient.post<any>(`${this.baseServerUrl}/upload`, contacts, {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(
      map(response => {
        return response.message;
      }),
      catchError(error => {
        return throwError(() => new Error(error.error.errorMessage))
      })
    )
  }

  updateContact(contact: ContactType): Observable<string> {
    const url = `${this.baseServerUrl}/users/${contact.id}`;
    return this.httpClient.put<any>(url, contact, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(
      map(response => response.message), 
      catchError(error => throwError(() => new Error(error.error.errorMessage || 'Unknown error')))
    );
  }

  deleteContact(id: number): Observable<number> {
    return this.httpClient.delete<number>(`${this.baseServerUrl}/users/${id}`).pipe(
      catchError(error => {
        return throwError(() => new Error(error.error.errorMessage));
      })
    )
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
