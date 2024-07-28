import { Component, OnInit } from '@angular/core';
import { BackendService } from '../../backend.service';
import { ContactType, FetchedContactType } from '../../interfaces';
import { Store } from '@ngrx/store';
import { updateContacts } from '../../store/actions/contacts.actions';

@Component({
  selector: 'app-contact-list',
  templateUrl: './contact-list.component.html',
  styleUrl: './contact-list.component.scss'
})
export class ContactListComponent implements OnInit {

  contactList: ContactType [] = [];
  existingIds = new Set<number>();

  constructor(private backendService: BackendService, private store: Store<{newContact: ContactType}>) {
  }

  ngOnInit(): void {
  }

  addRandomContact() {
    this.backendService.getNewContactData(10).subscribe(newContacts => {
      this.contactList.push(...newContacts);
      this.storeNewContacts(newContacts);
    });
  }

  storeNewContacts(newContacts: FetchedContactType[]): void {
    const processedContacts = this.convertContacts(newContacts);
    this.store.dispatch(updateContacts({contacts: processedContacts}));
  }

  convertContacts(contacts: FetchedContactType[]): ContactType[] {
    return contacts.map((contact: FetchedContactType) => ({
      //Sometimes API is sending id.value as undefined so i will generate random ID for this case.
      //Anyway, I think the better solution would be to use Set for not having duplicates values.
      //I will improve it if I have time as the last task 
      id: this.backendService.assignOrConvertId(contact.id.value),
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
