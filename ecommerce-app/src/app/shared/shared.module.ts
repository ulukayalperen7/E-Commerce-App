import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../features/visitor/components/navbar/navbar.component';
import { FooterComponent } from '../features/visitor/components/footer/footer.component';
import { BannerComponent } from '../features/visitor/components/banner/banner.component';
import { SidebarComponent } from '../features/visitor/components/sidebar/sidebar.component';

@NgModule({
  declarations: [NavbarComponent,
    FooterComponent,
    BannerComponent,
    SidebarComponent
  ],
  imports: [CommonModule],
  exports: [NavbarComponent,
    FooterComponent,
    BannerComponent,
    SidebarComponent
  ] 
})
export class SharedModule { }
