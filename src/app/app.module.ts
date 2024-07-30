import { NgModule } from '@angular/core';
import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BackendService } from './backend.service';
import { HttpClientModule } from '@angular/common/http';
import { UsersListComponent } from './components/users-list/users-list.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { provideRouter, Routes } from '@angular/router';
import { ContactListComponent } from './pages/contact-list/contact-list.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { StoreModule } from '@ngrx/store';
import { contactsReducer } from './store/contacts.reducer';
import { ContactsEffects } from './store/effects/contacts.effects';
import { EffectsModule } from '@ngrx/effects';
import { NewContactComponent } from './pages/new-contact/new-contact.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ContactDetailsComponent } from './pages/contact-details/contact-details.component';

@NgModule({
  declarations: [
    AppComponent,
    UsersListComponent,
    NavbarComponent,
    ContactListComponent,
    PageNotFoundComponent,
    NewContactComponent,
    ContactDetailsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    StoreModule.forRoot({contacts: contactsReducer}),
    EffectsModule.forRoot([ContactsEffects]),
    ReactiveFormsModule
  ],
  providers: [
    BackendService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
