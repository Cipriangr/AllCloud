import { Component, OnInit } from '@angular/core';
import { NetworkService } from './network-worker.service';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  statusMessage: string = '';
  timerSubscription!: Subscription;
  subscriptions = new Subscription();

  constructor(private networkService: NetworkService) { 
  }

  ngOnInit() {
    this.handleStatusMessage();
  }

  handleStatusMessage(): void {
    this.subscriptions.add(this.networkService.statusText$.subscribe({
      next:((message) => {
        console.log('!!message', message);
        this.statusMessage = message;
      })
    })
  )}

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
