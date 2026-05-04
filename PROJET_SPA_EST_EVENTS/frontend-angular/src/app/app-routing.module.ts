import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { EventsComponent } from './events/events.component';
import { EventDetailComponent } from './events/event-detail/event-detail.component';
import { ReservationComponent } from './reservation/reservation.component';
import { ProfilComponent } from './profil/profil.component';
import { WeblabComponent } from './weblab/weblab.component';
import { ApisAvanceesComponent } from './apis-avancees/apis-avancees.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ContactComponent } from './contact/contact.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { AdminComponent } from './admin/admin.component';
import { AdminGuard } from './shared/guards/admin.guard';
import { AproposComponent } from './apropos/apropos.component';

const routes: Routes = [
  { path: '',            component: HomeComponent },
  { path: 'events',      component: EventsComponent },
  { path: 'events/:id',  component: EventDetailComponent },
  { path: 'reservation', component: ReservationComponent },
  { path: 'profil',      component: ProfilComponent },
  { path: 'weblab',      component: WeblabComponent },
  { path: 'apis',        component: ApisAvanceesComponent },
  { path: 'dashboard',   component: DashboardComponent },
  { path: 'contact',     component: ContactComponent },
  { path: 'login',       component: LoginComponent },
  { path: 'register',    component: RegisterComponent },
  { path: 'admin',       component: AdminComponent, canActivate: [AdminGuard] },
  { path: 'apropos',     component: AproposComponent },
  { path: '**',          component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
