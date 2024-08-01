import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContactListComponent } from './pages/contact-list/contact-list.component';
import { ContactDetailsComponent } from './pages/contact-details/contact-details.component';
import { NewContactComponent } from './pages/new-contact/new-contact.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { ContactEditComponent } from './pages/contact-edit/contact-edit.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'contact-list' },
  { path: 'contact-list', component: ContactListComponent },
  { path: 'contact-details/:id', component: ContactDetailsComponent},
  { path: 'contact-details/:id/edit', component: ContactEditComponent },
  { path: 'new-contact', component: NewContactComponent },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
