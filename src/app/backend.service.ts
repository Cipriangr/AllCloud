import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  baseServerUrl = 'http://localhost:3000';

  constructor(private httpClient: HttpClient) { }

  getUsers() {
    return this.httpClient.get<any[]>(`${this.baseServerUrl}/users`);
  }

  getNewContactData() {
    let newContact: [] = [];
    this.httpClient.get<any>('https://randomuser.me/api').subscribe(
      data => {
        newContact = data.results[0];
        console.log('!!data', newContact);
      }
    )
    return newContact;
  }


}
