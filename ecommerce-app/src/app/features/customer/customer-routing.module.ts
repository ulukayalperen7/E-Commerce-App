import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerHomeComponent } from './pages/customer-home/customer-home.component';
import { CustomerCartComponent } from './pages/customer-cart/customer-cart.component';
import { CustomerProfileComponent } from './pages/customer-profile/customer-profile.component';
import { OrderHistoryComponent } from './pages/order-history/order-history.component';
import { CustomerCategoryProductsComponent } from './pages/customer-category-products/customer-category-products.component';
import { AuthGuard } from '../../core/guards/auth.guard';
import { FavoritesComponent } from './pages/favorites/favorites.component';

const routes: Routes = [
  { path: 'home',           component: CustomerHomeComponent },
  { path: 'cart',           component: CustomerCartComponent,          canActivate: [AuthGuard] },
  { path: 'favorites',      component: FavoritesComponent,             canActivate: [AuthGuard] },
  { path: 'profile',        component: CustomerProfileComponent,       canActivate: [AuthGuard] },
  { path: 'order-history',  component: OrderHistoryComponent,          canActivate: [AuthGuard] },
  { path: 'category/:id',   component: CustomerCategoryProductsComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerRoutingModule { }
