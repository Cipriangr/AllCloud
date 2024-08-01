import { Component, OnDestroy, OnInit } from '@angular/core';
import { BackendService } from '../../core.service';
import { ContactType, FetchedContactType } from '../../interfaces';
import { select, Store } from '@ngrx/store';
import { clearErrorMessage, clearSuccessMessage, updateContacts } from '../../store/actions/contacts.actions';
import { finalize, Observable, of, Subject, Subscription, switchMap, takeUntil, timer } from 'rxjs';
import { selectUpdateContactsError, selectUpdateContactsSuccess } from '../../store/selectors/contacts.selectors';

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

  constructor(private backendService: BackendService, private store: Store<{newContact: ContactType}>) {
  }

  ngOnInit(): void {
    this.succesUploadContact$ = this.store.pipe(select(selectUpdateContactsSuccess));
    this.failedUploadContact$ = this.store.pipe(select(selectUpdateContactsError));
    this.handleMessages();
  }

  handleDeletedContactMessage(): void {
    const deleteObs = this.backendService.deleteObservable$.subscribe({
      next:((response) => {
        if (response) {
          console.log('!!response0', response);
          this.deletedMessage = response;
          this.isDeletedTriggered = true;
          //easier way to make message dissapear from template after 4 seconds instead of NRGX way
          timer(4000).subscribe(() => {
            this.deletedMessage = '';
            this.isDeletedTriggered = false;
            this.backendService.resetMessages();
            
          });
        }
      })
    })
    this.subscriptions.add(deleteObs);
  }

  handleEditedContactMessage(): void {
    const editObs = this.backendService.contactEditObservable$.subscribe({
      next:((response) =>{
        if (response) {
          console.log('!!response', response);
          this.editedMessage = response;
          this.isEditedTriggered = true;
          timer(4000).subscribe(() =>  {
            this.editedMessage = '';
            this.isEditedTriggered = false;
            this.backendService.resetMessages();
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
    if (this.isButtonDisabled) {
      return;
    }
    this.isButtonDisabled = true;
    const newContactsSub = this.backendService.getNewContactData(10).pipe(
      switchMap(newContacts => {
        this.storeNewContacts(newContacts);
        // Disable the button for 5 seconds after pressing
        return timer(this.messageTimer);
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
      id: this.backendService.assignOrConvertId(contact.id.value),
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
    this.backendService.resetMessages();
    this.subscriptions.unsubscribe();
  }

}
