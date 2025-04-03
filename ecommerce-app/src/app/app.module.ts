import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared/shared.module'; 
import { VisitorModule } from './features/visitor/visitor.module';
import { CustomerModule } from './features/customer/customer.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, SharedModule,VisitorModule, CustomerModule,ReactiveFormsModule, RouterModule],  
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
