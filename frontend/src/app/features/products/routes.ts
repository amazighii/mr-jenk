import { Routes } from '@angular/router';

export const PRODUCT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./products-list-page').then((m) => m.ProductsListPage),
  },
  {
    path: ':id',
    loadComponent: () => import('./product-details-page').then((m) => m.ProductDetailsPage),
  },
];

