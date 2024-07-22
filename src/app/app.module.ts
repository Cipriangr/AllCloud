import { NgModule } from '@angular/core';
import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BackendService } from './backend.service';
import { HttpClientModule } from '@angular/common/http';
import { UsersListComponent } from './users-list/users-list.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { provideRouter, Routes } from '@angular/router';
import { ContactListComponent } from './pages/contact-list/contact-list.component';
import { DetailPageComponent } from './pages/detail-page/detail-page.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';

const routes: Routes = [
  { path: 'contact-list', component: ContactListComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'detail-page', component: DetailPageComponent },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    UsersListComponent,
    NavbarComponent,
    DetailPageComponent,
    ContactListComponent,
    PageNotFoundComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
  ],
  providers: [
    BackendService,
    provideRouter(routes)
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
