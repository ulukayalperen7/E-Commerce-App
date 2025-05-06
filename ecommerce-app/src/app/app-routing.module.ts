import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: 'customer',
    canLoad: [AuthGuard],      // Block loading of module if not logged in
    canActivate: [AuthGuard],  // Block direct navigation if not logged in
    canActivateChild: [AuthGuard],
    loadChildren: () =>
      import('./features/customer/customer.module').then(m => m.CustomerModule)
  },
  { 
    path: 'visitor',
    loadChildren: () => import('./features/visitor/visitor.module').then(m => m.VisitorModule)
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: '',
    loadChildren: () =>
      import('./features/visitor/visitor.module').then(m => m.VisitorModule)
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      // Enable this for better debugging of route-related issues
      enableTracing: false, // Set to true temporarily if you need to debug routing
      // Use hash routing for better compatibility in some scenarios
      useHash: false,
      // Scroll position restoration
      scrollPositionRestoration: 'enabled'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}