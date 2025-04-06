import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerRoutingModule } from './customer-routing.module'; 
import { SharedModule } from '../../shared/shared.module'; 

import { CustomerHomeComponent } from './pages/customer-home/customer-home.component';
import { CustomerCartComponent } from './pages/customer-cart/customer-cart.component';
import { CustomerProfileComponent } from './pages/customer-profile/customer-profile.component';
import { OrderHistoryComponent } from './pages/order-history/order-history.component';
import { RouterModule } from '@angular/router';
import { FavoritesComponent } from './pages/favorites/favorites.component';

@NgModule({
  declarations: [
    CustomerHomeComponent,
    CustomerCartComponent,
    CustomerProfileComponent,
    OrderHistoryComponent,
    FavoritesComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    CustomerRoutingModule,
    SharedModule 
  ]
})
export class CustomerModule { }
