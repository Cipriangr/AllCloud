import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { addContacts, loadContacts } from '../../store/actions/contacts.actions';
import { ContactFormData, ContactsState, ContactType, RequestType } from '../../interfaces';
import { CoreService } from '../../core.service';
import { selectAllContacts } from '../../store/selectors/contacts.selectors';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { NetworkService } from '../../network-worker.service';

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

  constructor(private store: Store<{contacts: ContactsState}>, private formBuilder: FormBuilder, private coreService: CoreService,
              private router: Router, private networkService: NetworkService) {
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
    // this.store.dispatch(loadContacts());
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
      id: this.coreService.assignOrConvertId(),
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
    if (!this.networkService.isUserOnline()) {
      this.networkService.queueRequest({type: RequestType.addSingleContact, payload: [contactData]})
      this.router.navigate(['/contact-list']);
      return;
    }

    this.store.dispatch(addContacts({contacts: [contactData]}))
    // this.contacts$.subscribe(contacts => console.log('Check contacts store', contacts));
    this.router.navigate(['/contact-list'])
  }
}
