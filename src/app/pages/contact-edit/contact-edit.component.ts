import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, Observable, of, Subscription, switchMap, tap } from 'rxjs';
import { ContactType, RequestType } from '../../interfaces';
import { CoreService } from '../../core.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NetworkService } from '../../network-worker.service';

@Component({
  selector: 'app-contact-edit',
  templateUrl: './contact-edit.component.html',
  styleUrl: './contact-edit.component.scss'
})
export class ContactEditComponent implements OnInit, OnDestroy {
  contact!: ContactType;
  contactError = false;
  private subscriptions = new Subscription();
  contactFormGroup!: FormGroup;
  test: Observable<ContactType[]> = of([]);
  contactId!: number;

  constructor(private activatedRoute: ActivatedRoute, private coreService: CoreService,
              private fb: FormBuilder, private router: Router, private network: NetworkService) {
  }

  ngOnInit(): void {
    this.initializeForm();
    this.getContactData();
  }

  initializeForm(): void {
    this.contactFormGroup = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(25)]],
      lastName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(25)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      age: ['', [Validators.required, Validators.pattern(/^[1-9][0-9]{0,1}$/)]],
      gender: ['']
    });
  }

getContactData(): void {
  const routeSubscription = this.activatedRoute.params.pipe(
    tap(params => {
      this.contactId = Number(params['id']);
    }),
    switchMap(() => this.coreService.fetchAndCacheContactById(this.contactId)),
    tap(contact => {
      this.contact = contact;
      const genderNormalized = contact.gender.charAt(0).toUpperCase() + contact.gender.slice(1).toLowerCase();
      this.contactFormGroup.patchValue({
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        phone: contact.phone,
        age: contact.age,
        gender: genderNormalized
      });
      this.contactError = false;
    }),
    catchError(error => {
      this.contactError = true;
      console.error('Error fetching contact data:', error);
      return of(null);
    })
  ).subscribe();

  this.subscriptions.add(routeSubscription);
}
  
  onSubmit(): void {
    if (this.contactFormGroup.valid) {
      const updatedContact = { ...this.contact, ...this.contactFormGroup.value };
      if (!this.network.isUserOnline()) {
        this.network.queueRequest({type: RequestType.updateContact, payload: updatedContact})
        this.router.navigate(['/contact-list']);
        return;
      }
      //update contact and create messages to be displayed on homepage(contact-list)
      const updateContactSub = this.coreService.updateExistingContact(updatedContact).subscribe({
        next: () => {
          this.coreService.contactEditMessage('Contact Edited Succesfully');
          this.router.navigate(['/contact-list']);
        },
        error: () => {
          this.coreService.contactEditMessage('Contact edit error');
          console.error('Error updating contact');
        }
      });
      this.subscriptions.add(updateContactSub);
    }
  }

  checkValidInput(ControlType: string): boolean {
    const control = this.contactFormGroup.get(ControlType);
    return control?.valid ?? false;
  }

  displayImage(contact: ContactType): string {
    if (!contact.large || !this.network.isUserOnline()) {
      return "/assets/noimage.webp";
    }
    return contact.large;
  }

  
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
