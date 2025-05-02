import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from './components/footer/footer.component';
import { BannerComponent } from './components/banner/banner.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    FooterComponent,
    BannerComponent,
  ],
  imports: [CommonModule,RouterModule],
  exports: [ 
    FooterComponent,
    BannerComponent,
  ]
})
export class SharedModule { }
