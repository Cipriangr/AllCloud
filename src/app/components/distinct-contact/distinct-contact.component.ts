import { AfterContentInit, AfterViewInit, Component, ContentChild, ElementRef, Input, } from '@angular/core';
import { ContactType } from '../../interfaces';

@Component({
  selector: 'app-distinct-contact',
  templateUrl: './distinct-contact.component.html',
  styleUrl: './distinct-contact.component.scss',
})
export class DistinctContactComponent implements AfterContentInit {
  @Input() contact!: ContactType;
  @ContentChild("age") ageProjected!: ElementRef;

  constructor() {
  }

  ngAfterContentInit(): void {
    this.ageProjected.nativeElement.setAttribute('style','color: blue');
  }

  displayImage(contact: ContactType): string {
    if (!contact.thumbnail) {
      return "/assets/noimage.webp";
    }
    return contact.medium;
  }
  
}
