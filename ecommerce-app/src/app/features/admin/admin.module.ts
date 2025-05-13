import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { SharedModule } from '../../shared/shared.module';

import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { UserManagementComponent } from './pages/user-management/user-management.component';
import { ProductManagementComponent } from './pages/product-management/product-management.component';
import { OrderTrackingComponent } from './pages/order-tracking/order-tracking.component';
import { IssueResolutionComponent } from './pages/issue-resolution/issue-resolution.component';
import { AdminHomeComponent } from './pages/admin-home/admin-home.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ProductFormComponent } from './pages/product-management/product-form/product-form.component';

@NgModule({
  declarations: [
    AdminDashboardComponent,
    UserManagementComponent,
    ProductManagementComponent,
    OrderTrackingComponent,
    IssueResolutionComponent,
    AdminHomeComponent,
    ProductFormComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    SharedModule,
    ReactiveFormsModule
  ]
})
export class AdminModule { }
