import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { ProductListComponent } from './pages/product-list/product-list.component';
import { RegisterComponent } from './pages/register/register.component'; 
import { AboutComponent } from './pages/about/about.component';
import { ContactComponent } from './pages/contact/contact.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'products', component: ProductListComponent }, 
  { path: 'register', component: RegisterComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'about', component : AboutComponent},
  { path: 'contact', component: ContactComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VisitorRoutingModule { }