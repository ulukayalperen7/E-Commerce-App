import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerProductDetailComponent } from './customer-product-detail.component';

describe('CustomerProductDetailComponent', () => {
  let component: CustomerProductDetailComponent;
  let fixture: ComponentFixture<CustomerProductDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomerProductDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerProductDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
