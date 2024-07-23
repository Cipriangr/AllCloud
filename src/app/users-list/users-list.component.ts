import { Component } from '@angular/core';
import { BackendService } from '../backend.service';
import { ContactType } from '../interfaces';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss',
})
export class UsersListComponent {

  contacts: ContactType[] = [];

  constructor(private backend: BackendService) { }

  ngOnInit(): void {
    this.backend.getUsers().subscribe(data => {
      console.log('!!data', data);
      this.contacts = data;
    })
  }


}
