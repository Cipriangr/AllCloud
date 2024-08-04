import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreService } from './core.service';
import { HttpClientModule } from '@angular/common/http';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ContactListComponent } from './pages/contact-list/contact-list.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { StoreModule } from '@ngrx/store';
import { contactsReducer } from './store/contacts.reducer';
import { ContactsEffects } from './store/effects/contacts.effects';
import { EffectsModule } from '@ngrx/effects';
import { NewContactComponent } from './pages/new-contact/new-contact.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ContactDetailsComponent } from './pages/contact-details/contact-details.component';
import { ContactEditComponent } from './pages/contact-edit/contact-edit.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { NetworkService } from './network-worker.service';
import { DistinctContactComponent } from './components/distinct-contact/distinct-contact.component';

@NgModule({
  declarations: [
    AppComponent,
    DistinctContactComponent,
    NavbarComponent,
    ContactListComponent,
    PageNotFoundComponent,
    NewContactComponent,
    ContactDetailsComponent,
    ContactEditComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    StoreModule.forRoot({contacts: contactsReducer}),
    EffectsModule.forRoot([ContactsEffects]),
    ReactiveFormsModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [
    CoreService, NetworkService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
