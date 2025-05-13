import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { LoginCredentials, AuthResponse } from '../../../../core/models/auth.model';

@Component({
  selector: 'app-login',
  standalone : false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = '';
  private returnUrl: string;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/customer/home';
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const credentials: LoginCredentials = this.loginForm.value;
    this.authService.login(credentials).subscribe({
      next: (authResponse: AuthResponse) => {
        this.errorMessage = '';
        const userRole = authResponse.user.role;

        if (userRole === 'ROLE_ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else if (userRole === 'ROLE_SELLER') {
          this.router.navigate(['/seller/dashboard']);
        } else {
          this.router.navigateByUrl(this.returnUrl);
        }
      },
      error: (err) => {
        this.errorMessage = err.message || 'Incorrect email or password.';
        console.error('Login error:', err);
      }
    });
  }
}