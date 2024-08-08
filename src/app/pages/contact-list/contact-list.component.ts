import { Component, OnDestroy, OnInit } from '@angular/core';
import { CoreService } from '../../core.service';
import { ContactType, RequestType } from '../../interfaces';
import { select, Store } from '@ngrx/store';
import { clearErrorMessage, clearSuccessMessage } from '../../store/actions/contacts.actions';
import { catchError, concatMap, finalize, Observable, of, Subject, Subscription, switchMap, takeUntil, timer } from 'rxjs';
import { selectUpdateContactsError, selectUpdateContactsSuccess } from '../../store/selectors/contacts.selectors';
import { NetworkService } from '../../network-worker.service';

@Component({
  selector: 'app-contact-list',
  templateUrl: './contact-list.component.html',
  styleUrl: './contact-list.component.scss'
})
export class ContactListComponent implements OnInit, OnDestroy {

  contactList!: ContactType[];
  succesUploadContact$!: Observable<string | null>;
  failedUploadContact$!: Observable<string | null>;
  subscriptions = new Subscription();
  isButtonDisabled = false;
  isDeletedTriggered = false;
  isEditedTriggered = false;
  deletedMessage = '';
  editedMessage = ''
  destroy$ = new Subject<void>();
  messageTimer: number = 4000;

  constructor(private coreService: CoreService, private store: Store<{newContact: ContactType}>, private network: NetworkService) {
  }

  ngOnInit(): void {
    this.succesUploadContact$ = this.store.pipe(select(selectUpdateContactsSuccess));
    this.failedUploadContact$ = this.store.pipe(select(selectUpdateContactsError));
    this.getContactsFromDB();
    this.handleMessages();
  }

  getContactsFromDB(): void {
    const loadContactsSub = this.coreService.getContacts().pipe(
      concatMap(() => this.coreService.contactsObservable$),
      catchError(err => {
        //Todo HANDLE ERROR
        return of([]);
      })
    ).subscribe(contacts => {
      this.contactList = contacts;
    });
    this.subscriptions.add(loadContactsSub);
  }
  
  showDeleteMessage(): boolean {
    return !!this.deletedMessage && this.isDeletedTriggered;
  }

  showEditMessage(): boolean {
    return !!this.editedMessage && this.isEditedTriggered;
  }

  handleMessages(): void {
    this.handleSuccessMessages();
    this.handleErrorMessages();
    this.handleDeletedContactMessage();
    this.handleEditedContactMessage();
  }

  addRandomContacts(): void {
    if (!this.network.isUserOnline()) {
      this.handleOfflineAddContact();
      return;
    }

    this.isButtonDisabled = true;
    const newContactsSub = this.coreService.getNewContactData(10).pipe(
      concatMap(newContacts => {
        this.coreService.storeNewContacts(newContacts);
        // Disable the button for 5 seconds after being pressed
        return timer(5000);
      }),
      finalize(() => {
        this.isButtonDisabled = false;
      })
    ).subscribe();
    this.subscriptions.add(newContactsSub);
  }

  handleOfflineAddContact(): void {
    this.network.queueRequest({ type: RequestType.addMultipleContacts, payload: 10 });
    this.isButtonDisabled = true;
    timer(5000).subscribe(() => {
      this.isButtonDisabled = false;
    });
  }

  
  handleDeletedContactMessage(): void {
    const deleteObs = this.coreService.deleteObservable$.subscribe({
      next:((response) => {
        if (response) {
          this.deletedMessage = response;
          this.isDeletedTriggered = true;
          //alternative way to make message dissapear from template after 4 seconds instead of NRGX way
          timer(this.messageTimer).subscribe(() => {
            this.deletedMessage = '';
            this.isDeletedTriggered = false;
            this.coreService.resetMessages();
          });
        }
      })
    })
    this.subscriptions.add(deleteObs);
  }

  handleEditedContactMessage(): void {
    const editObs = this.coreService.contactEditObservable$.subscribe({
      next:((response) =>{
        if (response) {
          this.editedMessage = response;
          this.isEditedTriggered = true;
          timer(this.messageTimer).subscribe(() =>  {
            this.editedMessage = '';
            this.isEditedTriggered = false;
            this.coreService.resetMessages();
          });
        }
      })
    })
    this.subscriptions.add(editObs);
  }

  handleSuccessMessages(): void {
    this.succesUploadContact$.pipe(
      switchMap(message => {
        if (message) {
          return timer(this.messageTimer).pipe(
            switchMap(() => {
              this.store.dispatch(clearSuccessMessage());
              return of(null); // Complete the observable
            })
          );
        }
        return of(null); // No message, so complete immediately
      }),
      takeUntil(this.destroy$)
    ).subscribe()
  }

  handleErrorMessages(): void {
    this.failedUploadContact$.pipe(
      switchMap(message => {
        if (message) {
          return timer(this.messageTimer).pipe(
            switchMap(() => {
              this.store.dispatch(clearErrorMessage());
              return of(null);
            })
          );
        }
        return of(null);
      }),
      takeUntil(this.destroy$)
    ).subscribe()
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.coreService.resetMessages();
    this.subscriptions.unsubscribe();
    this.store.dispatch(clearSuccessMessage());
    this.store.dispatch(clearErrorMessage());
  }

}
