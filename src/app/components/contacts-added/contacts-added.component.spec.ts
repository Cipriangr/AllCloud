import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactsAddedComponent } from './contacts-added.component';

describe('UsersListComponent', () => {
  let component: ContactsAddedComponent;
  let fixture: ComponentFixture<ContactsAddedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContactsAddedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactsAddedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
