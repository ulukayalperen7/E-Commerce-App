import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerCategoryProductsComponent } from './customer-category-products.component';

describe('CustomerCategoryProductsComponent', () => {
  let component: CustomerCategoryProductsComponent;
  let fixture: ComponentFixture<CustomerCategoryProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomerCategoryProductsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerCategoryProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
