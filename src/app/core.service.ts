import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ContactType, ApiResponseType } from './interfaces';
import { BehaviorSubject, catchError, map, Observable, Subject, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  baseServerUrl = 'http://localhost:3000';
  contactsBehaviour = new BehaviorSubject<ContactType[]>([]);
  contacts$ = this.contactsBehaviour.asObservable();
  deleteSubject$ = new BehaviorSubject<string>('');
  deleteObservable$ = this.deleteSubject$.asObservable();
  contactEditSubject$ = new BehaviorSubject<string>('');
  contactEditObservable$ = this.contactEditSubject$.asObservable();

  constructor(private httpClient: HttpClient) { }

  getContacts(): Observable<ContactType[]> {
    return this.httpClient.get<ContactType[]>(`${this.baseServerUrl}/users`);
  }

  //implemented behavioursubject for learning purposes which can be used as loadContact effect I keep ngrx to handle this for now
  loadContactsAsObservable(): void {
    this.getContacts().subscribe({
      next: contacts => this.contactsBehaviour.next(contacts),
      error: (err) => console.error('Error loading contacts', err)
    })
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
      tap((data: ApiResponseType) => console.log('!!data', data)),
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

}
