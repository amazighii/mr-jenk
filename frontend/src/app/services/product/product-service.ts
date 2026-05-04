import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';


@Injectable({
  providedIn: 'root',
})
export class ProductService {
  apiUrl = environment.apiUrl;
  constructor() { }

  async getProducts() {
    try {
      return fetch(this.apiUrl + '/products')
        .then(response => {
          console.log('API Response:', response);
          return response.json();
        });
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }
}
