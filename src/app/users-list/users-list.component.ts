import { Component } from '@angular/core';
import { BackendService } from '../backend.service';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss',
})
export class UsersListComponent {

  users: any[] = [];

  constructor(private backend: BackendService) {}

  ngOnInit(): void {
    this.backend.getUsers().subscribe(data => {
      console.log('test', data);
      this.users = data
    })
  }


}
