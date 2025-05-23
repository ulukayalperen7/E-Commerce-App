import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../../core/guards/auth.guard';
import { CustomerHomeComponent } from './pages/customer-home/customer-home.component';
import { CustomerCartComponent } from './pages/customer-cart/customer-cart.component';
import { OrderHistoryComponent } from './pages/order-history/order-history.component';
import { CustomerCategoryProductsComponent } from './pages/customer-category-products/customer-category-products.component';
import { FavoritesComponent } from './pages/favorites/favorites.component';
import { CustomerProfileComponent } from './pages/customer-profile/customer-profile.component';
import { CustomerProductDetailComponent } from './pages/customer-product-detail/customer-product-detail.component';
import { CustomerCheckoutComponent } from './pages/customer-checkout/customer-checkout.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      { path: 'home',        component: CustomerHomeComponent },
      { path: 'cart',        component: CustomerCartComponent },
      { path: 'checkout',    component: CustomerCheckoutComponent },
      { path: 'favorites',   component: FavoritesComponent },
      { path: 'order-history', component: OrderHistoryComponent },
      { path: 'category/:id/:name', component: CustomerCategoryProductsComponent },
      { path: 'category/:id', component: CustomerCategoryProductsComponent },
      { path: 'product/:id',  component: CustomerProductDetailComponent },
      { path: 'profile',      component: CustomerProfileComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerRoutingModule {}