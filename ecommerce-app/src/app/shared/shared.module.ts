import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../features/visitor/components/navbar/navbar.component';

@NgModule({
  declarations: [NavbarComponent], // Navbar artık standalone değil, burada tanımlandı
  imports: [CommonModule],
  exports: [NavbarComponent] // Diğer modüllerle paylaşmak için export edildi
})
export class SharedModule { }
