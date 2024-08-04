import { Component, OnDestroy, OnInit } from '@angular/core';
import { CoreService } from '../../core.service';
import { ContactType, RequestType } from '../../interfaces';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, of, Subscription, switchMap, tap } from 'rxjs';
import { NetworkService } from '../../network-worker.service';

@Component({
  selector: 'app-contact-details',
  templateUrl: './contact-details.component.html',
  styleUrl: './contact-details.component.scss'
})
export class ContactDetailsComponent implements OnInit, OnDestroy {
  contact!: ContactType;
  deleteError: boolean = false;
  private subscriptions = new Subscription();
  test: ContactType[] = [];
  contactError: Boolean = false;
  contactId!: number;

  constructor(private coreService: CoreService, private activatedRoute: ActivatedRoute, private route: Router, private network: NetworkService) {
  }

  ngOnInit(): void {
    this.getContactData();
    // this.coreService.contacts$.subscribe(
    // )
  }

  getContactData(): void {
    const routeSubscription = this.activatedRoute.params.pipe(
      tap(params => {
        this.contactId = Number(params['id']);
      }),
      switchMap(() => this.coreService.fetchAndCacheContactById(this.contactId)),
      tap(contact => {
        this.contact = contact;
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
  
  navigateToEdit(id: number) {
    this.route.navigate(['/contact-details', id, 'edit']);
  }

  deleteContact(id: number): void {
    if (!this.network.isUserOnline()) {
      this.network.queueRequest({type: RequestType.deleteContact, payload: id})
      this.route.navigate(['/contact-list']);
      return;
    }
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

  displayImage(contact: ContactType): string {
    if (!contact.large || !this.network.isUserOnline()) {
      return "/assets/noimage.webp";
    }
    return contact.large;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
