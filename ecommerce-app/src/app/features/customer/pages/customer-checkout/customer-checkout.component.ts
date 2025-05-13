import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { AddressService } from '../../../../core/services/address.service';
import { OrderService } from '../../../../core/services/order.service';
import { PaymentService } from '../../../../core/services/payment.service';
import { Cart } from '../../../../core/models/cart.model';
import { AddressResponse, AddressRequest } from '../../../../core/models/address.model';
import { OrderRequest, Order } from '../../../../core/models/order.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-customer-checkout',
  standalone: false,
  templateUrl: './customer-checkout.component.html',
  styleUrls: ['./customer-checkout.component.scss']
})
export class CustomerCheckoutComponent implements OnInit, OnDestroy {
  stripe: Stripe | null = null;
  elements: StripeElements | undefined;
  cardElement: StripeCardElement | undefined;

  @ViewChild('cardElementRef') cardElementRef!: ElementRef;

  passedCart: Cart | null = null;
  clientSecret: string | null = null;
  createdOrder: Order | null = null;

  userAddresses: AddressResponse[] = [];
  selectedAddressId: number | null = null;
  showAddAddressForm = false;
  addressForm!: FormGroup;

  stage: 'address' | 'payment' | 'success' | 'initial_error' = 'initial_error';
  isLoading = false;
  errorMessage: string | null = null;
  
  stripePublishableKey = 'pk_test_SENIN_STRIPE_PUBLISHABLE_KEYIN'; 

  get selectedShippingAddress(): AddressResponse | undefined {
    if (this.selectedAddressId && this.userAddresses.length > 0) {
      return this.userAddresses.find(a => a.addressId === this.selectedAddressId);
    }
    return undefined;
  }

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private addressService: AddressService,
    private orderService: OrderService,
    private paymentService: PaymentService,
    private fb: FormBuilder
  ) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { cartFromNav?: Cart };
    if (state && state.cartFromNav && state.cartFromNav.cartItems && state.cartFromNav.cartItems.length > 0) {
      this.passedCart = state.cartFromNav;
      this.stage = 'address';
    } else {
      this.errorMessage = "No valid cart found. Please return to your cart.";
    }
  }

  async ngOnInit(): Promise<void> {
    if (this.stage === 'initial_error') return;

    this.isLoading = true;
    this.initializeAddressForm();
    await this.loadUserAddresses();

    if (!this.stripePublishableKey || !this.stripePublishableKey.startsWith('pk_test_')) {
      this.errorMessage = 'Ödeme sistemi yapılandırma hatası.';
      this.isLoading = false;
      return;
    }

    try {
      this.stripe = await loadStripe(this.stripePublishableKey);
      if (!this.stripe) throw new Error('Stripe could not be loaded.');
      this.elements = this.stripe.elements();
      if (!this.elements) throw new Error('Stripe Elements could not be loaded.');
    } catch (error: any) {
      this.errorMessage = error.message || 'Stripe yüklenirken bir sorun oluştu.';
    }
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    if (this.cardElement) {
      this.cardElement.destroy();
    }
  }

  initializeAddressForm(): void {
    this.addressForm = this.fb.group({
      addressLine: ['', Validators.required],
      city: ['', Validators.required],
      district: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: ['', Validators.required]
    });
  }

  async loadUserAddresses(): Promise<void> {
    this.errorMessage = null;
    this.isLoading = true;
    try {
      const addresses = await this.addressService.getMyAddresses().toPromise();
      this.userAddresses = addresses || [];
      if (this.userAddresses.length > 0 && !this.selectedAddressId) {
        this.selectedAddressId = this.userAddresses[0].addressId;
      }
    } catch (error: any) {
      this.errorMessage = 'Adresler yüklenirken bir hata oluştu.';
    }
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  toggleAddAddressForm(): void {
    this.showAddAddressForm = !this.showAddAddressForm;
    this.errorMessage = null;
    if (this.showAddAddressForm) {
      this.initializeAddressForm();
    }
  }

  async onSaveNewAddress(): Promise<void> {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.errorMessage = null;
    try {
      await this.addressService.createAddress(this.addressForm.value).toPromise();
      await this.loadUserAddresses();
      this.showAddAddressForm = false;
    } catch (err: any) {
      this.errorMessage = 'Yeni adres kaydedilemedi: ' + (err.error?.message || err.message);
    }
    this.isLoading = false;
  }
  
  async onProceedToPaymentStep(): Promise<void> {
    this.errorMessage = null;
    if (!this.selectedAddressId) {
      this.errorMessage = 'Lütfen bir kargo adresi seçin.';
      return;
    }
    if (!this.passedCart) return;

    this.isLoading = true;
    const orderRequest: OrderRequest = { shippingAddressId: this.selectedAddressId };

    try {
      const orderResponse = await this.orderService.createOrderFromCart(orderRequest).toPromise();
      if (!orderResponse || !orderResponse.orderId) throw new Error('Order ID could not be retrieved.');
      this.createdOrder = orderResponse;

      const piResponse = await this.paymentService.createPaymentIntent(this.createdOrder.orderId).toPromise();
      if (!piResponse || !piResponse.clientSecret) throw new Error('Payment Intent could not be created.');
      
      this.clientSecret = piResponse.clientSecret;
      this.stage = 'payment';
      this.cdr.detectChanges(); 
      
      setTimeout(() => this.setupStripeCardElement(), 0);

    } catch (error: any) {
      this.errorMessage = 'Ödeme hazırlanamadı: ' + (error.error?.message || error.message);
      this.stage = 'address';
    }
    this.isLoading = false;
  }
  
  setupStripeCardElement(): void {
    if (this.elements && this.cardElementRef?.nativeElement && this.stage === 'payment') {
      if (this.cardElement) {
        this.cardElement.destroy();
      }
      this.cardElement = this.elements.create('card');
      this.cardElement.mount(this.cardElementRef.nativeElement);
      this.cardElement.on('change', (event) => {
        this.errorMessage = event.error ? event.error.message : null;
        this.cdr.detectChanges();
      });
    }
  }

  async handleSubmitPayment(): Promise<void> {
    if (this.isLoading || !this.stripe || !this.cardElement || !this.clientSecret || !this.createdOrder) {
      return;
    }
    this.isLoading = true;
    this.errorMessage = null;

    const { error, paymentIntent } = await this.stripe.confirmCardPayment(
      this.clientSecret,
      { payment_method: { card: this.cardElement } }
    );

    if (error) {
      this.errorMessage = error.message || 'Beklenmedik bir ödeme hatası oluştu.';
    } else if (paymentIntent) {
      if (paymentIntent.status === 'succeeded') {
        this.stage = 'success';
        setTimeout(() => {
            this.router.navigate(['/customer/order-history']);
        }, 3000);
      } else {
        this.errorMessage = `Ödeme durumu: ${paymentIntent.status}. Lütfen tekrar deneyin.`;
      }
    }
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  onAddressSelectionChange(event: Event): void {
    const selectedVal = (event.target as HTMLSelectElement).value;
    this.selectedAddressId = selectedVal ? +selectedVal : null;
    this.errorMessage = null;
  }
}