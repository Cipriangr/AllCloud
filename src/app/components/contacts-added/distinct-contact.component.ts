import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ContactType, RequestType } from '../../interfaces';
import { NetworkService } from '../../network-worker.service';
import { CoreService } from '../../core.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-distinct-contact',
  templateUrl: './distinct-contact.component.html',
  styleUrl: './distinct-contact.component.scss',
})
export class DistinctContactComponent implements OnInit, OnDestroy {
  @Input() contact!: ContactType;
  // contact!: ContactType;
  private subscriptions = new Subscription();

  constructor(private network: NetworkService, private coreService: CoreService) {
  }

  ngOnInit(): void {
    // this.getContact();
  }

  displayImage(contact: ContactType): string {
    if (!contact.thumbnail) {
      return "/assets/noimage.webp";
    }
    return contact.medium;
  }

  // getContact(): void {
  //   const contactSub = this.coreService.loadContactByIdWithCache(this.contact.id).subscribe({
  //     next: (contact) => {
  //       this.contact = contact;
  //     },
  //     error: (err) => {
  //       console.error('Error fetching contact:', err);
  //     },
  //   });
  //   this.subscriptions.add(contactSub);
  // }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  
}
