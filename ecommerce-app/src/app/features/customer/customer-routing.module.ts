import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerHomeComponent } from './pages/customer-home/customer-home.component';
import { CustomerCartComponent } from './pages/customer-cart/customer-cart.component';
import { CustomerProfileComponent } from './pages/customer-profile/customer-profile.component';
import { OrderHistoryComponent } from './pages/order-history/order-history.component';

const routes: Routes = [
  { path: '', component: CustomerHomeComponent },
  { path: 'cart', component: CustomerCartComponent },
  { path: 'profile', component: CustomerProfileComponent },
  { path: 'orders', component: OrderHistoryComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerRoutingModule { }
