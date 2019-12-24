import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { RegistrationComponent } from './pages/registration/registration.component';

const routes: Routes = [
  { path: '',   redirectTo: 'reg', pathMatch: 'full' },
  { path: 'reg', component: RegistrationComponent},
  { path: 'reg/:id', component: RegistrationComponent},
  { path: 'home', component: HomeComponent},
];


@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
