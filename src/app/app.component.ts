import { Component, OnInit } from '@angular/core';
import { NetworkService } from './network-worker.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  statusMessage: string = '';

  constructor(private networkService: NetworkService) { 
  }

  ngOnInit() {
    this.networkService.statusMessage$.subscribe(message => {
      this.statusMessage = message;
    })
  }
}
