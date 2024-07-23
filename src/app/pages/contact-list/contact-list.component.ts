import { Component, OnInit } from '@angular/core';
import { BackendService } from '../../backend.service';

@Component({
  selector: 'app-contact-list',
  templateUrl: './contact-list.component.html',
  styleUrl: './contact-list.component.scss'
})
export class ContactListComponent implements OnInit {

  contactList: any;

  constructor(private backendService: BackendService) {
    // this.getContactList();
  }

  ngOnInit(): void {
    console.log('!!contactlist', this.contactList);
  }

  addNewContact() {
    const test = this.backendService.getNewContactData();
    console.log('!test', test);
  }

  // getContactList() {
  //   this.httpClient.get<any>('https://randomuser.me/api').subscribe(
  //     data => {
  //       this.contactList = data
  //       console.log('!!data', this.contactList);
  //     }
  //   )
  // }

}
