import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VisitorRoutingModule } from './visitor-routing.module';
import { HomeComponent } from './pages/home/home.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [HomeComponent], // HomeComponent standalone değilse buraya eklenecek
  imports: [CommonModule, VisitorRoutingModule, SharedModule]
})
export class VisitorModule { }
