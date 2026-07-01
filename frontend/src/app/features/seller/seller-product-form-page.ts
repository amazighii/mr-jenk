import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { lastValueFrom, tap } from 'rxjs';

import { MediaService } from '../../core/services/media.service';
import { ProductsService } from '../../core/services/products.service';
import type { ProductRequest, ProductResponse } from '../../core/models/product.models';
import { SessionStore } from '../../core/state/session.store';
import { ToastService } from '../../core/services/toast.service';
import { extractApiErrorMessage } from '../../core/utils/http-error';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, SpinnerComponent],
  template: `
    <div class="surface page">
      <div class="top">
        <div>
          <h1>{{ isEdit() ? 'Edit product' : 'New product' }}</h1>
          <p class="mutedSmall">
            Images are uploaded through the gateway to the Media Service (max 2 MB). On create, images are uploaded at
            save time to avoid orphan cleanup.
          </p>
        </div>
        <a class="btn btn--ghost" routerLink="/seller/products">Back</a>
      </div>

      @if (loading()) {
        <div class="center"><app-spinner /></div>
      } @else {
        <form class="form" [formGroup]="form" (ngSubmit)="submit()">
          <div class="row">
            <label for="name">Name</label>
            <input id="name" type="text" formControlName="name" />
            @if (form.controls.name.touched && form.controls.name.invalid) {
              <div class="error">Name is required.</div>
            }
          </div>

          <div class="row">
            <label for="description">Description</label>
            <textarea id="description" formControlName="description"></textarea>
            @if (form.controls.description.touched && form.controls.description.invalid) {
              <div class="error">Description is required.</div>
            }
          </div>

          <div class="row">
            <label for="price">Price</label>
            <input id="price" type="number" min="0.01" step="0.01" formControlName="price" />
            @if (form.controls.price.touched && form.controls.price.invalid) {
              <div class="error">Price must be greater than 0.</div>
            }
          </div>

          <div class="row">
            <label for="quantity">Quantity</label>
            <input id="quantity" type="number" min="0" step="1" formControlName="quantity" />
            @if (form.controls.quantity.touched && form.controls.quantity.invalid) {
              <div class="error">Quantity cannot be negative.</div>
            }
          </div>

          <div class="row images">
            <label>Images</label>

            @if (isEdit()) {
              <div class="note">Current images</div>
              <div class="thumbs">
                @for (url of visibleExistingImageUrls(); track url) {
                  <div class="thumb">
                    <img [src]="url" alt="" />
                    <button class="thumbRemove" type="button" aria-label="Remove image" (click)="removeExistingImage(url)">
                      ×
                    </button>
                  </div>
                }
              </div>
              @if (visibleExistingImageUrls().length === 0) {
                <div class="note">No current images.</div>
              }
            }

            @if (previews().length) {
              <div class="note">New images to add</div>
              <div class="thumbs">
                @for (p of previews(); track p; let i = $index) {
                  <div class="thumb">
                    <img [src]="p" alt="" />
                    <button class="thumbRemove" type="button" aria-label="Remove selected image" (click)="removeSelectedFile(i)">
                      ×
                    </button>
                  </div>
                }
              </div>
            }

            <input type="file" accept="image/*" multiple (change)="onFiles($event)" />
            @if (imagesError()) {
              <div class="error">{{ imagesError() }}</div>
            }
            @if (uploadProgress() !== null) {
              <div class="note">Upload: {{ uploadProgress() }}%</div>
            }
          </div>

          @if (submitError()) {
            <div class="error">{{ submitError() }}</div>
          }

          <div class="actions">
            <button class="btn" type="submit" [disabled]="saving() || form.invalid">
              @if (saving()) { Saving… } @else { Save }
            </button>
          </div>
        </form>
      }
    </div>
  `,
  styleUrl: './seller.styles.css',
  styles: [
    `
      .center {
        padding: 26px 0;
        display: grid;
        place-items: center;
      }
      .thumb {
        position: relative;
      }
      .thumbRemove {
        position: absolute;
        top: 6px;
        right: 6px;
        width: 24px;
        height: 24px;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.75);
        background: rgba(17, 24, 39, 0.78);
        color: white;
        font-size: 17px;
        line-height: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }
      .thumbRemove:hover {
        background: rgba(180, 35, 24, 0.92);
      }
    `,
  ],
})
export class SellerProductFormPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly products = inject(ProductsService);
  private readonly media = inject(MediaService);
  private readonly session = inject(SessionStore);
  private readonly toast = inject(ToastService);

  readonly productId = computed(() => this.route.snapshot.paramMap.get('id'));
  readonly isEdit = computed(() => Boolean(this.productId()));

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly imagesError = signal<string | null>(null);
  readonly submitError = signal<string | null>(null);
  readonly uploadProgress = signal<number | null>(null);

  readonly selectedFiles = signal<File[]>([]);
  readonly previews = signal<string[]>([]);
  readonly removedImageUrls = signal<string[]>([]);

  readonly existing = signal<ProductResponse | null>(null);
  readonly existingImageUrls = computed(() => this.existing()?.imageUrls ?? []);
  readonly visibleExistingImageUrls = computed(() => {
    const removed = new Set(this.removedImageUrls());
    return this.existingImageUrls().filter((url) => !removed.has(url));
  });

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    description: ['', [Validators.required]],
    price: [0.01, [Validators.required, Validators.min(0.01)]],
    quantity: [0, [Validators.required, Validators.min(0)]],
  });

  constructor() {
    if (this.isEdit()) void this.loadExisting();
  }

  onFiles(ev: Event) {
    this.imagesError.set(null);
    const input = ev.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (!files.length) return;

    for (const f of files) {
      if (!f.type.startsWith('image/')) {
        this.imagesError.set('Only image/* files are allowed.');
        return;
      }
      if (f.size > MAX_IMAGE_BYTES) {
        this.imagesError.set('Each file must be <= 2 MB.');
        return;
      }
    }

    this.selectedFiles.update((current) => [...current, ...files]);
    this.previews.update((current) => [...current, ...files.map((f) => URL.createObjectURL(f))]);
    input.value = '';
  }

  removeExistingImage(url: string) {
    this.removedImageUrls.update((current) => (current.includes(url) ? current : [...current, url]));
  }

  removeSelectedFile(index: number) {
    const previews = this.previews();
    const preview = previews[index];
    if (preview) URL.revokeObjectURL(preview);

    this.selectedFiles.update((files) => files.filter((_, i) => i !== index));
    this.previews.update((items) => items.filter((_, i) => i !== index));
  }

  async loadExisting() {
    const id = this.productId();
    if (!id) return;
    this.loading.set(true);
    try {
      const product = await this.products.get(id);
      if (product.sellerId !== this.session.userId()) {
        this.toast.show('error', 'Forbidden', 'You can only edit your own products.');
        await this.router.navigateByUrl('/seller/products');
        return;
      }
      this.existing.set(product);
      this.form.patchValue({
        name: product.name,
        description: product.description,
        price: Number(product.price),
        quantity: Number(product.quantity),
      });
    } catch (e) {
      this.toast.show('error', 'Could not load product', this.extractError(e));
      await this.router.navigateByUrl('/seller/products');
    } finally {
      this.loading.set(false);
    }
  }

  async submit() {
    if (this.form.invalid || this.saving()) return;
    this.submitError.set(null);
    this.imagesError.set(null);

    const isEdit = this.isEdit();
    const id = this.productId();

    // if (!isEdit && this.selectedFiles().length === 0) {
    //   this.imagesError.set('Please select at least one image.');
    //   return;
    // }

    this.saving.set(true);
    try {
      this.uploadProgress.set(null);
      let imageUrls = this.existingImageUrls();
      if (isEdit && id) {
        const keptImageUrls = this.visibleExistingImageUrls();
        imageUrls = keptImageUrls;

        if (this.selectedFiles().length > 0 || this.removedImageUrls().length > 0) {
          const updated = await this.media.updateProductImages(id, this.selectedFiles(), this.removedImageUrls());
          const addedImageUrls = updated.response?.response?.map((x) => x.url) ?? [];
          imageUrls = [...keptImageUrls, ...addedImageUrls];
        }
      } else if (this.selectedFiles().length > 0) {
          const stream = this.media.uploadProductImages(this.selectedFiles()).pipe(
            tap((evt) => {
              if (evt.state === 'progress') this.uploadProgress.set(evt.progress ?? 0);
            }),
          );
          const done = await lastValueFrom(stream);
          this.uploadProgress.set(100);
          imageUrls = (done.data ?? []).map((x) => x.url);
      }

      const v = this.form.getRawValue();
      const payload: ProductRequest = {
        name: v.name,
        description: v.description,
        price: Number(v.price),
        quantity: Number(v.quantity),
        imageUrls: imageUrls || [],
      };

      console.log('Submitting product', { payload, isEdit, id });

      if (isEdit && id) {
        await this.products.update(id, payload);
        this.toast.show('success', 'Product updated');
      } else {
        await this.products.create(payload);
        this.toast.show('success', 'Product created');
      }

      await this.router.navigateByUrl('/seller/products');
    } catch (e) {
      const msg = this.extractError(e);
      console.error('Error saving product', e);
      this.submitError.set(msg);
      this.toast.show('error', 'Save failed', msg);
    } finally {
      this.saving.set(false);
      this.uploadProgress.set(null);
    }
  }

  private extractError(e: unknown): string {
    return extractApiErrorMessage(e, 'Request failed.');
  }
}
