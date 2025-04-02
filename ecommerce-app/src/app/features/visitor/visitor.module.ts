import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VisitorRoutingModule } from './visitor-routing.module';
import { HomeComponent } from './pages/home/home.component';
import { SharedModule } from '../../shared/shared.module'; // SharedModule'i import ettik
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [HomeComponent], 
  imports: [
    CommonModule, 
    VisitorRoutingModule, 
    SharedModule,
    ReactiveFormsModule
  ]
})
export class VisitorModule { }
