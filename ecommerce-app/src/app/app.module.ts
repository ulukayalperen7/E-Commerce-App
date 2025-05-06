import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared/shared.module'; 
import { ReactiveFormsModule } from '@angular/forms';
import { CustomerProductDetailComponent } from './customer/pages/customer-product-detail/customer-product-detail.component';

@NgModule({
  declarations: [AppComponent, CustomerProductDetailComponent],
  imports: [BrowserModule, AppRoutingModule, SharedModule,ReactiveFormsModule, RouterModule],  
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
