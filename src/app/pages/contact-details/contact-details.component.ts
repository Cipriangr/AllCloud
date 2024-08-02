import { Component, OnDestroy, OnInit } from '@angular/core';
import { CoreService } from '../../core.service';
import { ContactType } from '../../interfaces';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-contact-details',
  templateUrl: './contact-details.component.html',
  styleUrl: './contact-details.component.scss'
})
export class ContactDetailsComponent implements OnInit, OnDestroy {
  contact: ContactType | undefined;
  deleteError: boolean = false;
  private subscriptions = new Subscription();

  constructor(private coreService: CoreService, private activatedRoute: ActivatedRoute, private route: Router) {
  }

  ngOnInit(): void {
    this.getContactId();
    // this.coreService.contacts$.subscribe(
    //   contact => console.log(contact)
    // )
    console.log(this.coreService.contactsBehaviour);
  }

  //get ContactId so I can use it to display the contact informations
  getContactId() {
    const contactId = this.activatedRoute.params.subscribe(params => {
      console.log('!!params', params);
      const id = params['id'];
      const contactData = this.coreService.loadContactById(id).subscribe({
        next: contact => {
          console.log('!!contact', contact);
          this.contact = contact;
        }
      })
      this.subscriptions.add(contactData);
    })
    this.subscriptions.add(contactId);
  }

  navigateToEdit(id: number) {
    this.route.navigate(['/contact-details', id, 'edit']);
  }

  deleteContact(id: number): void {
    const deleteSub = this.coreService.deleteContact(id).subscribe({
      next: () => {
        this.coreService.deleteMessage('Contact Deleted Succesfully');
        this.route.navigate(['/contact-list'])
      },
      error: () => {
        this.coreService.deleteMessage(`The Contact Couldn't be Deleted`);
        this.route.navigate(['/contact-list']);
      }
    });
    this.subscriptions.add(deleteSub);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
