import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent }          from './pages/home/home.component';
import { LoginComponent }         from './pages/login/login.component';
import { RegisterComponent }      from './pages/register/register.component';
import { AboutComponent }         from './pages/about/about.component';
import { ContactComponent }       from './pages/contact/contact.component';
import { LoginRequiredComponent } from './pages/login-required/login-required.component';
import { CustomerCartComponent }  from '../customer/pages/customer-cart/customer-cart.component';
import { FavoritesComponent }     from '../customer/pages/favorites/favorites.component';
import { AuthGuard }              from '../../core/guards/auth.guard';
import { CategoryProductsComponent } from './pages/category-products/category-products.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';

const routes: Routes = [
  { path: 'home',          component: HomeComponent },
  { path: 'category/:id', component: CategoryProductsComponent },
  { path: 'category/:id/:name', component: CategoryProductsComponent },
  { path: 'product/:id',  component: ProductDetailComponent },
  { path: 'login',         component: LoginComponent },
  { path: 'register',      component: RegisterComponent },
  { path: 'about',         component: AboutComponent },
  { path: 'contact',       component: ContactComponent },
  { path: 'cart',          component: CustomerCartComponent, canActivate: [AuthGuard] },
  { path: 'favorites',     component: FavoritesComponent,   canActivate: [AuthGuard] },
  { path: 'login-required', component: LoginRequiredComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VisitorRoutingModule {}
