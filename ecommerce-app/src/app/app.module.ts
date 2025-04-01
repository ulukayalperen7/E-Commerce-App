import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared/shared.module';  // SharedModule import edildi
import { VisitorModule } from './features/visitor/visitor.module';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, SharedModule,VisitorModule],  // SharedModule burada kullanılıyor
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
