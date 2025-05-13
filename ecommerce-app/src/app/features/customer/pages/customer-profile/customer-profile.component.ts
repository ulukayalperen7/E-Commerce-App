import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AddressService } from '../../../../core/services/address.service';
import { AddressResponse, AddressRequest } from '../../../../core/models/address.model';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-customer-profile',
  standalone: false,
  templateUrl: './customer-profile.component.html',
  styleUrls: ['./customer-profile.component.scss']
})
export class CustomerProfileComponent implements OnInit {
  profileForm!: FormGroup;
  userAddresses: AddressResponse[] = [];
  showAddAddressForm = false;
  addressForm!: FormGroup;
  addressLoading = false;
  addressError: string | null = null;
  editingAddress: AddressResponse | null = null;

  passwordChangeLoading = false;
  passwordChangeError: string | null = null;
  passwordChangeSuccess: string | null = null;

  currentUser: User | null = null;

  constructor(
    private fb: FormBuilder,
    private addressService: AddressService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      firstName: [{ value: '', disabled: true }, Validators.required],
      lastName: [{ value: '', disabled: true }, Validators.required],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      currentPassword: [''],
      newPassword: [''],
      confirmPassword: ['']
    }, { validators: this.passwordMatchValidator });

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.profileForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        });
      }
    });

    this.initializeAddressForm();
    this.loadUserAddresses();
  }

  passwordMatchValidator(form: FormGroup) {
    const np = form.get('newPassword')?.value;
    const cp = form.get('confirmPassword')?.value;
    if ((np || cp) && np !== cp) {
      return { mismatch: true };
    }
    return null;
  }

  onUpdatePassword(): void {
    this.passwordChangeError = null;
    this.passwordChangeSuccess = null;
    const curPassCtrl = this.profileForm.get('currentPassword');
    const newPassCtrl = this.profileForm.get('newPassword');
    const confPassCtrl = this.profileForm.get('confirmPassword');

    curPassCtrl?.markAsTouched();
    newPassCtrl?.markAsTouched();
    confPassCtrl?.markAsTouched();

    if (!curPassCtrl?.value) { curPassCtrl?.setErrors({ required: true }); }
    if (!newPassCtrl?.value) { newPassCtrl?.setErrors({ required: true }); }
    if (!confPassCtrl?.value) { confPassCtrl?.setErrors({ required: true }); }

    if ( this.profileForm.errors?.['mismatch'] || curPassCtrl?.invalid || newPassCtrl?.invalid || confPassCtrl?.invalid ) {
      return;
    }
    
    this.passwordChangeLoading = true;
    console.log('Simulating password change. Current:', curPassCtrl?.value, 'New:', newPassCtrl?.value);
    setTimeout(() => {
        this.passwordChangeSuccess = "Password update simulated successfully.";
        this.passwordChangeLoading = false;
        curPassCtrl?.reset();
        newPassCtrl?.reset();
        confPassCtrl?.reset();
        this.profileForm.get('currentPassword')?.setErrors(null);
        this.profileForm.get('newPassword')?.setErrors(null);
        this.profileForm.get('confirmPassword')?.setErrors(null);
    }, 1500);
  }

  initializeAddressForm(addressToEdit?: AddressResponse): void {
    this.addressForm = this.fb.group({
      addressLine: [addressToEdit ? addressToEdit.addressLine : '', Validators.required],
      city: [addressToEdit ? addressToEdit.city : '', Validators.required],
      district: [addressToEdit ? addressToEdit.district : '', Validators.required],
      postalCode: [addressToEdit ? addressToEdit.postalCode : '', Validators.required],
      country: [addressToEdit ? addressToEdit.country : '', Validators.required]
    });
    if (addressToEdit) {
      this.editingAddress = addressToEdit;
    } else {
      this.editingAddress = null;
    }
  }

  loadUserAddresses(): void {
    this.addressLoading = true;
    this.addressError = null;
    this.addressService.getMyAddresses().subscribe({
      next: (addresses) => {
        this.userAddresses = addresses;
        this.addressLoading = false;
      },
      error: (err) => {
        this.addressError = 'Adresler yüklenirken bir hata oluştu.';
        this.addressLoading = false;
      }
    });
  }

  toggleAddAddressForm(editAddress?: AddressResponse): void {
    this.showAddAddressForm = !this.showAddAddressForm;
    this.addressError = null;
    if (this.showAddAddressForm) {
      this.initializeAddressForm(editAddress);
    } else {
      this.editingAddress = null;
    }
  }

  onSaveAddress(): void {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }

    this.addressLoading = true;
    this.addressError = null;
    const addressData: AddressRequest = this.addressForm.value;

    if (this.editingAddress && this.editingAddress.addressId) {
      console.log('Simulating address update for ID:', this.editingAddress.addressId, 'with data:', addressData);
      setTimeout(() => { 
        const index = this.userAddresses.findIndex(a => a.addressId === this.editingAddress!.addressId);
        if (index > -1) {
            this.userAddresses[index] = { ...this.editingAddress!, ...addressData };
        }
        this.toggleAddAddressForm();
        this.addressLoading = false;
      }, 1000);
    } else {
      this.addressService.createAddress(addressData).subscribe({
        next: (newAddress) => {
          this.userAddresses.push(newAddress);
          this.toggleAddAddressForm();
          this.addressLoading = false;
        },
        error: (err) => {
          this.addressError = 'Adres oluşturulurken bir hata oluştu: ' + (err.error?.message || err.message);
          this.addressLoading = false;
        }
      });
    }
  }

  onDeleteAddress(addressId: number): void {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }
    this.addressLoading = true;
    this.addressError = null;
    console.log('Simulating address delete for ID:', addressId);
    setTimeout(() => { 
        this.userAddresses = this.userAddresses.filter(addr => addr.addressId !== addressId);
        this.addressLoading = false;
    }, 1000);
  }
}