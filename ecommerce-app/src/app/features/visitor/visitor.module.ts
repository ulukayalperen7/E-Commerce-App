import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VisitorRoutingModule } from './visitor-routing.module';
import { HomeComponent } from './pages/home/home.component';
import { SharedModule } from '../../shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './pages/login/login.component';
import { ProductListComponent } from './pages/product-list/product-list.component'; 
import { RegisterComponent } from './pages/register/register.component'; 

@NgModule({
  declarations: [
    HomeComponent,
    LoginComponent,
    ProductListComponent, 
    RegisterComponent 
  ],
  imports: [
    CommonModule, 
    VisitorRoutingModule, 
    SharedModule,
    ReactiveFormsModule
  ]
})
export class VisitorModule { }