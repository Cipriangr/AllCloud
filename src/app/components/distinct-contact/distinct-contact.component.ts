import { Component, Input, } from '@angular/core';
import { ContactType } from '../../interfaces';

@Component({
  selector: 'app-distinct-contact',
  templateUrl: './distinct-contact.component.html',
  styleUrl: './distinct-contact.component.scss',
})
export class DistinctContactComponent {
  @Input() contact!: ContactType;

  constructor() {
  }

  displayImage(contact: ContactType): string {
    if (!contact.thumbnail) {
      return "/assets/noimage.webp";
    }
    return contact.medium;
  }
  
}
