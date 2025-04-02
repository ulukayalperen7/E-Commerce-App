import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { BannerComponent } from './components/banner/banner.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    NavbarComponent,
    FooterComponent,
    BannerComponent,
    SidebarComponent
  ],
  imports: [CommonModule,RouterModule],
  exports: [ 
    NavbarComponent,
    FooterComponent,
    BannerComponent,
    SidebarComponent
  ]
})
export class SharedModule { }
