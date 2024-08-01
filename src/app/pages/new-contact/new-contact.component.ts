import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { loadContacts, updateContacts } from '../../store/actions/contacts.actions';
import { ContactFormData, ContactsState, ContactType } from '../../interfaces';
import { BackendService } from '../../core.service';
import { selectAllContacts } from '../../store/selectors/contacts.selectors';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-contact',
  templateUrl: './new-contact.component.html',
  styleUrl: './new-contact.component.scss'
})
export class NewContactComponent implements OnInit {
  contactFormGroup!: FormGroup;
  errorForm: boolean = false;
  contact: ContactType[] = [];
  contacts$: Observable<ContactType[]>;

  constructor(private store: Store<{contacts: ContactsState}>, private formBuilder: FormBuilder, private backendService: BackendService,
              private router: Router) {
    this.contacts$ = this.store.pipe(select(selectAllContacts));
  }

  ngOnInit(): void {
    this.contactFormGroup = this.formBuilder.group({
      firstName: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(25)]],
      lastName: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(25)]],
      email: [null, [Validators.required, Validators.email]],
      phone: [null, [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      age: [null, [Validators.required, Validators.pattern(/^[1-9][0-9]{0,1}$/)]],
      image: [null],
      gender: ['Male']
    });
    this.store.dispatch(loadContacts());
  }

  checkValidInput(ControlType: string): boolean {
    const control = this.contactFormGroup.get(ControlType);
    if (!control?.valid) {
      return false;
    }
    //all inputs should be valid to be able to press Submit;
    return control?.valid;
  }

  saveContactData(contact: ContactFormData): ContactType {
    return {
      id: this.backendService.assignOrConvertId(),
      lastName: contact.lastName,
      email: contact.email,
      firstName: contact.firstName,
      title: (contact.gender === 'Male' ? 'Mr' : 'Ms'),
      age: contact.age,
      large: contact.image || '',
      medium: contact.image || '',
      thumbnail: contact.image || '',
      gender: contact.gender,
      phone: contact.phone 
    };
  }

  submitForm(event: Event): void {
    if (!this.contactFormGroup.valid) {
      this.errorForm = true;
      event.preventDefault();
      return;
    }
    this.errorForm = false;
    const contactData = this.saveContactData(this.contactFormGroup.value);
    console.log('!!contactdata', contactData);
    this.store.dispatch(updateContacts({contacts: [contactData]}))
    // this.contacts$.subscribe(contacts => console.log('Check contacts store', contacts));
    this.router.navigate(['/contact-list'])
  }
}
