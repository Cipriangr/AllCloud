import { Component, OnDestroy, OnInit } from '@angular/core';
import { BackendService } from '../../backend.service';
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
  deletedMessage = '';
  destroy$ = new Subject<void>();

  constructor(private backendService: BackendService, private store: Store<{newContact: ContactType}>) {
  }

  ngOnInit(): void {
    this.succesUploadContact$ = this.store.pipe(select(selectUpdateContactsSuccess));
    this.failedUploadContact$ = this.store.pipe(select(selectUpdateContactsError));
    this.hideUploadMessages();
    this.handleDeletedContactMessage();
  }

  handleDeletedContactMessage(): void {
    this.backendService.deleteObservable$.subscribe({
      next:((response) => {
        this.deletedMessage = response;
        this.isDeletedTriggered = true;
        //easier way to make message dissapear from template after 3 seconds instead of NRGX way
        timer(4000).subscribe(() => this.deletedMessage = '');
      })
    })
  }

  contactDeleted(): boolean {
    return !!this.deletedMessage && this.isDeletedTriggered;
  }
  handleSuccessMessages(): void {
    this.subscriptions.add(
      this.succesUploadContact$.pipe(
        switchMap(message => {
          if (message) {
            return timer(4000).pipe(
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
  }

  handleErrorMessages(): void {
    this.subscriptions.add(
      this.failedUploadContact$.pipe(
        switchMap(message => {
          if (message) {
            return timer(3000).pipe(
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
  }

  hideUploadMessages(): void {
    this.handleSuccessMessages();
    this.handleErrorMessages();
  }

  addRandomContacts(): void {
    if (this.isButtonDisabled) {
      return;
    }
    this.isButtonDisabled = true;
    this.backendService.getNewContactData(10).pipe(
      switchMap(newContacts => {
        this.storeNewContacts(newContacts);
        // Disable the button for 5 seconds after pressing
        return timer(5000);
      }),
      finalize(() => {
        this.isButtonDisabled = false;
      })
    ).subscribe();
  }

  storeNewContacts(newContacts: FetchedContactType[]): void {
    const processedContacts = this.convertContacts(newContacts);
    this.store.dispatch(updateContacts({contacts: processedContacts}));
  }

  convertContacts(contacts: FetchedContactType[]): ContactType[] {
    return contacts.map((contact: FetchedContactType) => ({
      //Sometimes API is sending id.value as undefined so i will generate random ID for this case.
      //Anyway, I think the better solution would be to use Set for not having duplicates values.
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
    this.subscriptions.unsubscribe();
  }

}
