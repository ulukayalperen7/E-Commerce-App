import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { UserManagementComponent } from './pages/user-management/user-management.component';
import { ProductManagementComponent } from './pages/product-management/product-management.component';
import { ProductFormComponent } from './pages/product-management/product-form/product-form.component';
import { OrderTrackingComponent } from './pages/order-tracking/order-tracking.component';
import { IssueResolutionComponent } from './pages/issue-resolution/issue-resolution.component';
import { AdminHomeComponent } from './pages/admin-home/admin-home.component';
import { AuthGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard], 
    component: AdminHomeComponent
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    component: AdminDashboardComponent
  },
  {
    path: 'user-management',
    canActivate: [AuthGuard],
    component: UserManagementComponent
  },
  {
    path: 'product-management',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: ProductManagementComponent,
        pathMatch: 'full'
      },
      {
        path: 'add',
        component: ProductFormComponent
      },
      {
        path: 'edit/:id',
        component: ProductFormComponent
      }
    ]
  },
  {
    path: 'order-tracking',
    canActivate: [AuthGuard],
    component: OrderTrackingComponent
  },
  {
    path: 'issue-resolution',
    canActivate: [AuthGuard],
    component: IssueResolutionComponent
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
