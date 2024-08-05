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
    const statusSub = this.networkService.statusText$.subscribe({
      next:((message) => {
        this.statusMessage = message;
        this.timerSubscription = timer(7000).subscribe(() => {
          this.statusMessage = '';
          this.networkService.resetMessageStatus();
        })
        this.subscriptions.add(this.timerSubscription);
      })
    })
    this.subscriptions.add(statusSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
