import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from './components/footer/footer.component';
import { BannerComponent } from './components/banner/banner.component';
import { RouterModule } from '@angular/router';
import { CategoryNavComponent } from './categories/category-nav/category-nav.component';

@NgModule({
  declarations: [
    FooterComponent,
    BannerComponent,
    CategoryNavComponent,
  ],
  imports: [CommonModule,RouterModule],
  exports: [ 
    FooterComponent,
    BannerComponent,
    CategoryNavComponent
  ]
})
export class SharedModule { }
