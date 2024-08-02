import { Injectable } from "@angular/core";
import { StatusMessage } from "./interfaces";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: 'root'
})

export class NetworkService {
  statusMessageSubject = new BehaviorSubject<string>('');
  statusMessage$ = this.statusMessageSubject.asObservable(); 

  constructor() {
    // window.addEventListener('online', () => this.handleOnline());
    // window.addEventListener('offline', () => this.handleOffline());
  }

  // async initIndexDbI() {
  //   this.db = await openDB('')
  // }

  isUserOnline(): boolean {
    return navigator.onLine;
  }

  updateMessageStatus(message: string): void {
    this.statusMessageSubject.next(message);
  }

  // handleOnline() {
  //   this.updateStatusMessage(StatusMessage.online);
  //   this.syncRequests();
  // }

  // handleOffline() {
  //   this.updateStatusMessage('You are offline. Any actions will be queued and processed once you are back online.');
  // }


}