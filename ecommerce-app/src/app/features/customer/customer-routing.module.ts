import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerHomeComponent } from './pages/customer-home/customer-home.component';
import { CustomerCartComponent } from './pages/customer-cart/customer-cart.component';

const routes: Routes = [
  { path: '', component: CustomerHomeComponent }, 
  { path: 'cart', component: CustomerCartComponent } 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerRoutingModule { }
