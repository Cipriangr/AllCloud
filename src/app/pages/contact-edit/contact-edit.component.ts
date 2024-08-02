import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ContactType } from '../../interfaces';
import { CoreService } from '../../core.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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

  constructor(private activatedRoute: ActivatedRoute, private coreService: CoreService,
              private fb: FormBuilder, private router: Router) {
  }

  ngOnInit(): void {
    this.getContactData();
    this.initializeForm();
  }

  initializeForm(): void {
    this.contactFormGroup = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(25)]],
      lastName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(25)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      age: ['', [Validators.required, Validators.pattern(/^[1-9][0-9]{0,1}$/)]],
      gender: ['Male']
    });
  }

  getContactData(): void {
    const routeSubscription = this.activatedRoute.params.subscribe({
      next: (data) => {
        const contactSubscription = this.coreService.loadContactById(data['id']).subscribe({
          next: contact => {
            this.contactFormGroup.patchValue(contact);
            this.contact = contact;
            this.contactError = false;
            console.log('Contactdata', this.contact);
          },
          error: () => {
            this.contactError = true;
          }
        });
        this.contactError = false;
        this.subscriptions.add(contactSubscription);
      },
      error: () => {
        this.contactError = true;
      }
    });
    this.subscriptions.add(routeSubscription);
  }

  onSubmit(): void {
    if (this.contactFormGroup.valid) {
      console.log('!!this.contactofmr', this.contactFormGroup)
      const updatedContact = { ...this.contact, ...this.contactFormGroup.value };
      console.log('Updated contact data:', updatedContact);
      //update contact and create messages to be displayed on homepage(contact-list)
      const updateContactSub = this.coreService.updateContact(updatedContact).subscribe({
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
  
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
