import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { RegisterPayload, AuthResponse } from '../../../../core/models/auth.model';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['ROLE_CUSTOMER', Validators.required]
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const payload: RegisterPayload = this.registerForm.value;
    
    this.authService.register(payload).subscribe({
      next: (authResponse: AuthResponse) => {
        const userRole = authResponse.user.role;
        if (userRole === 'ROLE_ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else if (userRole === 'ROLE_SELLER') {
          this.router.navigate(['/seller/dashboard']);
        } else {
          this.router.navigate(['/customer/home']);
        }
      },
      error: (err) => {
        this.errorMessage = err.message || 'Registration failed. Please try again.';
        console.error('Registration error:', err);
      }
    });
  }
}