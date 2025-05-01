import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerHomeComponent } from './pages/customer-home/customer-home.component';
import { CustomerCartComponent } from './pages/customer-cart/customer-cart.component';
import { CustomerProfileComponent } from './pages/customer-profile/customer-profile.component';
import { OrderHistoryComponent } from './pages/order-history/order-history.component';
import { CustomerCategoryProductsComponent } from './pages/customer-category-products/customer-category-products.component';
import { AuthGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  { path: 'home', component: CustomerHomeComponent }, 
  { path: 'cart', component: CustomerCartComponent },
  { path: 'profile', component: CustomerProfileComponent },
  { path: 'order-history', component: OrderHistoryComponent }, 
  { path: '', redirectTo: 'home', pathMatch: 'full' } ,{
    path: 'category/:id', component: CustomerCategoryProductsComponent,
    canActivate: [AuthGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerRoutingModule { }
