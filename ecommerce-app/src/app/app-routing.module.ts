import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './features/visitor/pages/home/home.component';  // HomeComponent import edildi

const routes: Routes = [
  { path: '', component: HomeComponent },  // HomeComponent yönlendirmesi burada
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],  // forRoot() sadece ana modülde kullanılır
  exports: [RouterModule]
})
export class AppRoutingModule { }