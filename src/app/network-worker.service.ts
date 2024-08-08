import { Injectable } from "@angular/core";
import { ContactType, RequestPayload, RequestSchema, RequestType, StatusMessage } from "./interfaces";
import { BehaviorSubject, catchError, concatMap, lastValueFrom, Observable, switchMap, tap, throwError, timer } from "rxjs";
import { openDB, IDBPDatabase } from 'idb';
import { CoreService } from "./core.service";

@Injectable({
  providedIn: 'root'
})

export class NetworkService {
  statusMessageSubject = new BehaviorSubject<string>('');
  statusText$ = this.statusMessageSubject.asObservable();
  indexDb!: IDBPDatabase<RequestSchema>;

  constructor(private coreService: CoreService) {
    this.initDB();
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  private async initDB() {
    this.indexDb = await openDB('RequestQueue', 1, {
      upgrade(db) {
        db.createObjectStore('requests', { keyPath: 'id', autoIncrement: true });
      }
    });
  }

  isUserOnline(): boolean {
    return navigator.onLine;
  }

  updateMessageStatus(message: string): void {
    this.statusMessageSubject.next(message);
    this.resetMessageStatus();
  }

  resetMessageStatus(): void {
    this.statusText$.pipe(
      switchMap(() => timer(3000)),
      tap(() => this.statusMessageSubject.next(''))
    ).subscribe();
  }

  handleOnline() {
    this.updateMessageStatus(StatusMessage.online);
    this.syncRequests();
  }

  handleOffline() {
    this.updateMessageStatus(StatusMessage.offline);
  }

  async addRequest(requestPayload: RequestPayload): Promise<number> {
    const tx = this.indexDb.transaction('requests', 'readwrite');
    const id = await tx.store.add(requestPayload); // `id` is auto-generated
    await tx.done;
    return id;
  }

  async getAllRequests(): Promise<{ id: number; data: RequestPayload }[]> {
    const tx = this.indexDb.transaction('requests', 'readonly');
    const requests = await tx.store.getAll();
    const keys = await tx.store.getAllKeys();
    await tx.done;
    
    return requests.map((request, index) => ({
      id: keys[index] as number,
      data: request
    }));
  }

  async removeRequest(id: number): Promise<void> {
    const tx = this.indexDb.transaction('requests', 'readwrite');
    await tx.store.delete(id);
    await tx.done;
  }
  
  async syncRequests(): Promise<void> {
    const requests = await this.getAllRequests();
    for (const request of requests) {
      try {
        //converts observable to promise to match this method
        await lastValueFrom(this.processRequest(request.data));
        await this.removeRequest(request.id);
      } catch (error) {
        console.error("Error processing request:", error);
      }
    }
  }
  
  processRequest(data: RequestPayload): Observable<any> {
    switch (data.type) {
      case RequestType.addMultipleContacts:
        return this.coreService.getNewContactData(data.payload as number).pipe(
          concatMap(newContacts => {
            this.coreService.storeNewContacts(newContacts);
            return newContacts;
          }),
          catchError(error => {
            console.error('Error adding contacts:', error);
            return throwError(() => new Error(error))
          })
        );
  
      case RequestType.deleteContact:
        return this.coreService.deleteContact(data.payload as number).pipe(
          catchError(error => {
            console.error('Error deleting contact:', error);
            return throwError(() => new Error(error))
          })
        );
  
      case RequestType.updateContact:
        return this.coreService.updateExistingContact(data.payload as ContactType).pipe(
          catchError(error => {
            console.error('Error updating contact:', error);
            return throwError(() => new Error(error))
          })
        );

      case RequestType.addSingleContact:
        return this.coreService.addNewContact(data.payload as ContactType[]).pipe(
          catchError(error => {
            console.error('Error updating contact:', error);
            return throwError(() => new Error(error))
          })
        );
  
      default:
        console.error('Unknown request type:', data.type);
        return throwError(() => new Error('error'))
    }
  }

  async queueRequest(requestData: RequestPayload) {
    this.updateMessageStatus(StatusMessage.offline);
    const data = { type: requestData.type, payload: requestData.payload };
    await this.addRequest(data);
  }

}