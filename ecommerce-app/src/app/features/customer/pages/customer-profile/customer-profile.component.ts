import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-customer-profile',
  standalone: false,
  templateUrl: './customer-profile.component.html',
  styleUrls: ['./customer-profile.component.scss']
})
export class CustomerProfileComponent implements OnInit {
  profileForm!: FormGroup;
  days = Array.from({ length: 31 }, (_, i) => i + 1);
  months = Array.from({ length: 12 }, (_, i) => i + 1);
  years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      birthDay: ['', Validators.required],
      birthMonth: ['', Validators.required],
      birthYear: ['', Validators.required],
      currentPassword: [''],
      newPassword: [''],
      confirmPassword: ['']
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const np = form.get('newPassword')?.value;
    const cp = form.get('confirmPassword')?.value;
    if ((np || cp) && np !== cp) {
      return { mismatch: true };
    }
    return null;
  }

  onSave(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    console.log('Profile saved', this.profileForm.value);
  }

  onViewOrders(): void {
  }
  onUpdatePassword(): void {
    const cur = this.profileForm.get('currentPassword')!;
    const nw  = this.profileForm.get('newPassword')!;
    const cp  = this.profileForm.get('confirmPassword')!;
  
    cur.markAsTouched();
    nw.markAsTouched();
    cp.markAsTouched();
  
    if (this.profileForm.errors?.['mismatch'] || nw.invalid || cp.invalid) {
      return;  
    }
  
    if (!cur.value) {
      cur.setErrors({ required: true });
      return;
    }
  
    console.log('Changing password to:', nw.value);
  
    cur.reset();
    nw.reset();
    cp.reset();
  }
}
