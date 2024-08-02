import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { CoreService } from '../../core.service';
import { ContactType, FetchedContactType, StatusMessage } from '../../interfaces';
import { select, Store } from '@ngrx/store';
import { clearErrorMessage, clearSuccessMessage, updateContacts } from '../../store/actions/contacts.actions';
import { finalize, Observable, of, Subject, Subscription, switchMap, takeUntil, timer } from 'rxjs';
import { selectUpdateContactsError, selectUpdateContactsSuccess } from '../../store/selectors/contacts.selectors';
import { NetworkService } from '../../network-worker.service';

@Component({
  selector: 'app-contact-list',
  templateUrl: './contact-list.component.html',
  styleUrl: './contact-list.component.scss'
})
export class ContactListComponent implements OnInit, OnDestroy {

  contactList: ContactType[] = [];
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
    this.loadContacts();
    this.handleMessages();
  }

  loadContacts(): void {
    this.coreService.loadContactsAsObservable();
    this.getContactsFromDB();
  }

  getContactsFromDB(): void {
    //I could handle with ngrx or Output from contacts-added component. I know is not needed to use both ngrx and rxjs but I implemented both for practice purposes
    const getContactsSub = this.coreService.contactsObservable$.subscribe({
      next:((response) => {
        if (response && response.length > 0) {
          console.log('!!response', response);
          this.contactList = response;
        }
      })
    })
    this.subscriptions.add(getContactsSub);
  }

  handleDeletedContactMessage(): void {
    const deleteObs = this.coreService.deleteObservable$.subscribe({
      next:((response) => {
        if (response) {
          console.log('!!response0', response);
          this.deletedMessage = response;
          this.isDeletedTriggered = true;
          //easier way to make message dissapear from template after 4 seconds instead of NRGX way
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
          console.log('!!response', response);
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

  showDeleteMessage(): boolean {
    return !!this.deletedMessage && this.isDeletedTriggered;
  }

  showEditMessage(): boolean {
    return !!this.editedMessage && this.isEditedTriggered;
  }

  handleSuccessMessages(): void {
    const successObS = this.subscriptions.add(
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
    );
    this.subscriptions.add(successObS);
  }

  handleErrorMessages(): void {
    const errorSub = this.subscriptions.add(
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
    );
    this.subscriptions.add(errorSub);
  }

  handleMessages(): void {
    this.handleSuccessMessages();
    this.handleErrorMessages();
    this.handleDeletedContactMessage();
    this.handleEditedContactMessage();
  }

  addRandomContacts(): void {
    if (!this.network.isUserOnline()) {
      this.network.updateMessageStatus(StatusMessage.offline);
      return;
    }
    this.isButtonDisabled = true;
    const newContactsSub = this.coreService.getNewContactData(10).pipe(
      switchMap(newContacts => {
        this.storeNewContacts(newContacts);
        // Disable the button for 5 seconds after pressed
        return timer(5000);
      }),
      finalize(() => {
        this.isButtonDisabled = false;
      })
    ).subscribe();
    this.subscriptions.add(newContactsSub);
  }

  storeNewContacts(newContacts: FetchedContactType[]): void {
    const processedContacts = this.convertContacts(newContacts);
    this.store.dispatch(updateContacts({contacts: processedContacts}));
  }

  convertContacts(contacts: FetchedContactType[]): ContactType[] {
    return contacts.map((contact: FetchedContactType) => ({
      //Sometimes API is sending id.value as undefined so i will generate random ID for this case even if ID can be duplicated.
      //Anyway, I think the best solution would be to use Set for not having duplicates values.
      //I will improve it if I have time as the last task 
      id: this.coreService.assignOrConvertId(contact.id.value),
      lastName: contact.name.last,
      email: contact.email,
      firstName: contact.name.first,
      title: contact.name.title,
      age: contact.dob.age,
      large: contact.picture.large,
      medium: contact.picture.medium,
      thumbnail: contact.picture.thumbnail,
      gender: contact.gender,
      phone: contact.phone 
    }));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    //clean the texts if user switches navigates to another page and back to contact-list faster than tthis.timer so it won't see the message
    this.coreService.resetMessages();
    this.subscriptions.unsubscribe();
  }

}
