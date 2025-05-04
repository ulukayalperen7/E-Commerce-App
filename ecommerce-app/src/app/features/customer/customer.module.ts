import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerRoutingModule } from './customer-routing.module'; 
import { SharedModule } from '../../shared/shared.module'; 

import { CustomerHomeComponent } from './pages/customer-home/customer-home.component';
import { CustomerCartComponent } from './pages/customer-cart/customer-cart.component';
import { OrderHistoryComponent } from './pages/order-history/order-history.component';
import { RouterModule } from '@angular/router';
import { FavoritesComponent } from './pages/favorites/favorites.component';
import { CustomerNavbarComponent } from './pages/customer-navbar/customer-navbar.component';
import { CustomerCategoryProductsComponent } from './pages/customer-category-products/customer-category-products.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    CustomerHomeComponent,
    CustomerCartComponent,
    OrderHistoryComponent,
    FavoritesComponent,
    CustomerNavbarComponent,
    CustomerCategoryProductsComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    CustomerRoutingModule,
    SharedModule ,
    ReactiveFormsModule
  ]
})
export class CustomerModule { }
