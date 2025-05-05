import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-required',
  standalone: false,
  templateUrl: './login-required.component.html',
  styleUrls: ['./login-required.component.scss']
})
export class LoginRequiredComponent {
  constructor(private router: Router) {}
  
  goToLogin() {
    this.router.navigate(['/login']);
  }
}