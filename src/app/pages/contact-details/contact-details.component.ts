import { Component, OnInit } from '@angular/core';
import { BackendService } from '../../backend.service';
import { ContactType } from '../../interfaces';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-contact-details',
  templateUrl: './contact-details.component.html',
  styleUrl: './contact-details.component.scss'
})
export class ContactDetailsComponent implements OnInit {
  contact: ContactType | undefined;
  deleteError: boolean = false;

  constructor(private backendService: BackendService, private activatedRoute: ActivatedRoute, private route: Router) {
  }

  ngOnInit(): void {
    this.getContactId();
    // this.backendService.contacts$.subscribe(
    //   contact => console.log(contact)
    // )
    // this.backendService.loadContactsAsObservable();
  }

  //get ContactId so I can use it to display the contact informations
  getContactId() {
    this.activatedRoute.params.subscribe(params => {
      console.log('!!params', params);
      const id = params['id'];
      this.backendService.loadContactById(id).subscribe({
        next: contact => {
          console.log('!!contact', contact);
          this.contact = contact;
        }
      })
    })
  }

  deleteContact(id: number): void {
    this.backendService.deleteContact(id).subscribe({
      next: () => {
        this.backendService.deleteMessage('Contact Deleted Succesfully');
        this.route.navigate(['/contact-list'])
      },
      error: () => {
        this.backendService.deleteMessage(`The contact couldn't be deleted`);
        this.route.navigate(['/contact-list']);
      }
    });
  }
}
