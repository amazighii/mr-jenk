import { Routes } from '@angular/router';
import { SellerLayoutComponent } from '../../layout/seller-layout/seller-layout.component';

export const SELLER_ROUTES: Routes = [
  {
    path: '',
    component: SellerLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },
      { path: 'overview', loadComponent: () => import('./seller-overview-page').then((m) => m.SellerOverviewPage) },
      { path: 'products', loadComponent: () => import('./seller-products-page').then((m) => m.SellerProductsPage) },
      { path: 'media', pathMatch: 'full', redirectTo: 'products' },
      { path: 'products/new', loadComponent: () => import('./seller-product-form-page').then((m) => m.SellerProductFormPage) },
      { path: 'products/:id/edit', loadComponent: () => import('./seller-product-form-page').then((m) => m.SellerProductFormPage) },
      { path: 'products/:id/media', redirectTo: 'products/:id/edit' },
    ],
  },
];
