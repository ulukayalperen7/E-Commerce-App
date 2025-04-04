import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { 
    path: '',  //  visitor module is on the root level (lazyloading )
    loadChildren: () => import('./features/visitor/visitor.module').then(m => m.VisitorModule) 
  },
  { 
    path: 'customer', 
    loadChildren: () => import('./features/customer/customer.module').then(m => m.CustomerModule) 
  },
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }