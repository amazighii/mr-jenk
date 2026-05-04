import { Component } from '@angular/core';
import { ProductService } from '../services/product/product-service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  products: any[] = [];

  constructor(private productService: ProductService) {
    this.fetchProducts();
  }

  async fetchProducts() {
    try {
      const response = await this.productService.getProducts();;
      console.log('Products fetched:', response);
      this.products = response;
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }

}
