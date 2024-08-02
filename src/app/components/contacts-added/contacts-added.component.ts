import { Component } from '@angular/core';
import { ContactsState, ContactType } from '../../interfaces';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { loadContacts } from '../../store/actions/contacts.actions';

@Component({
  selector: 'app-contacts-added',
  templateUrl: './contacts-added.component.html',
  styleUrl: './contacts-added.component.scss',
})
export class ContactsAddedComponent {

  contacts$: Observable<ContactType[]>;

  constructor(private store: Store<{ contacts: ContactsState}>) { 
    this.contacts$ = this.store.select(state => state.contacts.contacts);
  }

  ngOnInit(): void {
    this.store.dispatch(loadContacts());
  }

  displayImage(contact: ContactType): string {
    if (!contact.thumbnail) {
      return "/assets/noimage.webp";
    }
    return contact.medium;
  }
  
}
