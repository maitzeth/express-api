import ProductModel from './products.model';
import { Product } from '@/types';

export function createProduct(product: Product) {
  return new ProductModel({ ...product }).save();
};

export function getProducts() {
  return ProductModel.find();
}
