import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { UserManagementComponent } from './pages/user-management/user-management.component';
import { ProductManagementComponent } from './pages/product-management/product-management.component';
import { OrderTrackingComponent } from './pages/order-tracking/order-tracking.component';
import { IssueResolutionComponent } from './pages/issue-resolution/issue-resolution.component';

const routes: Routes = [
  { path: 'dashboard', component: AdminDashboardComponent },
  { path: 'user-management', component: UserManagementComponent },
  { path: 'product-management', component: ProductManagementComponent },
  { path: 'order-tracking', component: OrderTrackingComponent },
  { path: 'issue-resolution', component: IssueResolutionComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }  // Default route
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
