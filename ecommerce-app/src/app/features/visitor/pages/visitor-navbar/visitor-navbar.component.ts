import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Subscription, fromEvent } from 'rxjs';
import { throttleTime } from 'rxjs/operators';

@Component({
  selector: 'app-visitor-navbar',
  standalone :false,
  templateUrl: './visitor-navbar.component.html',
  styleUrls: ['./visitor-navbar.component.scss']
})
export class VisitorNavbarComponent implements OnInit, OnDestroy {
  isNavbarHidden = false;
  lastScrollPosition = 0;
  navbarHeight = 75;
  private scrollSub!: Subscription;

  ngOnInit() {
    this.scrollSub = fromEvent(window, 'scroll')
      .pipe(throttleTime(100))
      .subscribe(() => this.handleScroll());
  }

  ngOnDestroy() {
    this.scrollSub?.unsubscribe();
  }

  @HostListener('window:resize')
  onResize() {
    this.navbarHeight = document.querySelector('.visitor-navbar')?.clientHeight || 75;
  }

  private handleScroll() {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
      this.isNavbarHidden = false;
      return;
    }

    if (currentScroll > this.lastScrollPosition && !this.isNavbarHidden) {
      this.isNavbarHidden = true;
    } else if (currentScroll < this.lastScrollPosition && this.isNavbarHidden) {
      this.isNavbarHidden = false;
    }

    this.lastScrollPosition = currentScroll;
  }
}