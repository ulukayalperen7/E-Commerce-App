import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import {
  ProductDetail,
  AdminProductRequestPayload,
  BrandInProduct,
  CategoryInProduct
} from '../../../../../core/models/product.model';
import { AdminProductService } from '../../../../../core/services/adminProduct.service';

interface ImageToUpload {
  file: File;
  url: string | ArrayBuffer | null;
}

@Component({
  selector: 'app-product-form',
  standalone: false,
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit, OnDestroy {
  @ViewChild('additionalImagesInputRef') additionalImagesInputRef!: ElementRef<HTMLInputElement>;

  productForm!: FormGroup;
  editMode = false;
  productId: number | null = null;
  isLoading = false;
  pageTitle = 'Add New Product';
  private subscriptions = new Subscription();

  mainImageToUpload: ImageToUpload | null = null;
  additionalImagesToUpload: ImageToUpload[] = [];

  currentMainImageUrl: string | null = null;
  currentAdditionalImageUrls: { imageUrl: string, productImageId?: number }[] = [];

  availableBrands: BrandInProduct[] = [{ brandId: 1, name: 'Brand A' }, { brandId: 2, name: 'Brand B' }];
  availableCategories: CategoryInProduct[] = [{ categoryId: 1, name: 'Category X' }, { categoryId: 2, name: 'Category Y' }];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private adminProductService: AdminProductService
  ) {}

  ngOnInit(): void {
    this.initForm();
    const routeSub = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.productId = +id;
        this.editMode = true;
        this.pageTitle = 'Edit Product';
        this.loadProductData(this.productId);
      }
    });
    this.subscriptions.add(routeSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private initForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0.01)]],
      stockQuantity: [null, [Validators.required, Validators.min(0)]],
      categoryId: [null, Validators.required],
      brandId: [null, Validators.required],
      isActive: [true, Validators.required]
    });
  }

  private loadProductData(id: number): void {
    this.isLoading = true;
    this.adminProductService.getProductById(id)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (product) => {
          this.productForm.patchValue({
            name: product.name,
            description: product.description,
            price: product.price,
            stockQuantity: product.stockQuantity,
            categoryId: product.category.categoryId,
            brandId: product.brand.brandId,
            isActive: product.isActive
          });
          this.currentMainImageUrl = product.imageUrl || null;
          this.currentAdditionalImageUrls = product.additionalImages?.map(img => ({ imageUrl: img.imageUrl, productImageId: img.productImageId })) || [];
        },
        error: (err) => {
          console.error('Error loading product:', err);
          alert('Failed to load product data.');
          this.router.navigate(['/admin/product-management']);
        }
      });
  }

  onMainImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if(this.editMode) this.currentMainImageUrl = null;

      const reader = new FileReader();
      reader.onload = () => {
        this.mainImageToUpload = { file: file, url: reader.result };
      };
      reader.readAsDataURL(file);
      (event.target as HTMLInputElement).value = '';
    }
  }

  removeMainImageToUpload(): void {
    this.mainImageToUpload = null;
  }

  onAdditionalImagesSelected(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (files) {
      const maxImages = 4;
      this.additionalImagesToUpload = [];

      for (let i = 0; i < Math.min(files.length, maxImages); i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = () => {
          this.additionalImagesToUpload.push({ file: file, url: reader.result });
        };
        reader.readAsDataURL(file);
      }
      (event.target as HTMLInputElement).value = '';
    }
  }

  removeAdditionalImageToUpload(index: number): void {
    this.additionalImagesToUpload.splice(index, 1);
  }

  removeCurrentAdditionalImage(index: number): void {
    this.currentAdditionalImageUrls.splice(index, 1);
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      alert('Please fill all required fields.');
      return;
    }

    this.isLoading = true;

    const payload: AdminProductRequestPayload = {
      productId: this.editMode ? this.productId! : undefined,
      ...this.productForm.value
    };

    const formData = new FormData();
    formData.append('productPayloadJson', new Blob([JSON.stringify(payload)], { type: 'application/json' }));

    if (this.mainImageToUpload?.file) {
      formData.append('mainImageFile', this.mainImageToUpload.file, this.mainImageToUpload.file.name);
    } else if (this.editMode && !this.mainImageToUpload && !this.currentMainImageUrl) {
      formData.append('removeMainImage', 'true');
    }

    this.additionalImagesToUpload.forEach(img => {
      if (img.file) {
        formData.append('additionalImageFiles', img.file, img.file.name);
      }
    });

    let saveObservable: Observable<ProductDetail>;
    if (this.editMode && this.productId) {
      saveObservable = this.adminProductService.updateProduct(this.productId, formData);
    } else {
      saveObservable = this.adminProductService.createProduct(formData);
    }

    const saveSub = saveObservable
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: () => {
          alert(`Product ${this.editMode ? 'updated' : 'created'} successfully!`);
          this.router.navigate(['/admin/product-management']);
        },
        error: (err) => {
          console.error(`Error ${this.editMode ? 'updating' : 'creating'} product:`, err);
          alert(`Operation failed. ${err.message || 'Please try again.'}`);
        }
      });
    this.subscriptions.add(saveSub);
  }

  onCancel(): void {
    this.router.navigate(['/admin/product-management']);
  }

  get nameCtrl() { return this.productForm.get('name'); }
  get descriptionCtrl() { return this.productForm.get('description'); }
  get priceCtrl() { return this.productForm.get('price'); }
  get stockQuantityCtrl() { return this.productForm.get('stockQuantity'); }
  get categoryIdCtrl() { return this.productForm.get('categoryId'); }
  get brandIdCtrl() { return this.productForm.get('brandId'); }
}
