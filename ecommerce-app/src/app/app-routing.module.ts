import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { 
    path: '',  
    loadChildren: () => import('./features/visitor/visitor.module').then(m => m.VisitorModule)
  },
  { 
    path: 'customer', 
    loadChildren: () => import('./features/customer/customer.module').then(m => m.CustomerModule)
  },
  { 
    path: 'admin', 
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule) 
  },
  { path: '**', redirectTo: 'home' } 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
