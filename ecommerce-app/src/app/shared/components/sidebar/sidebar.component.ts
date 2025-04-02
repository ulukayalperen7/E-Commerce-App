import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone :false,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  sidebarVisible = false;
  private hoverTimeout: any;

  openSidebar() {
    this.hoverTimeout = setTimeout(() => {
      this.sidebarVisible = true;
    }, 400); 
  }

  closeSidebar() {
    clearTimeout(this.hoverTimeout);
    this.sidebarVisible = false;
  }
}
