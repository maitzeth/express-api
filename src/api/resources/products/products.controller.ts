import ProductModel from './products.model';
import { Product } from '@/types';

export function getProducts() {
  return ProductModel.find();
};

export function createProduct(product: Product) {
  return new ProductModel({ ...product }).save();
};

export function getProductById(id: string) {
  return ProductModel.findById(id);
};

export function deleteProductById(id: string) {
  return ProductModel.findByIdAndDelete(id);
};

export function updateProductById(id: string, product: Product) {
  return ProductModel.findByIdAndUpdate(id, product, { new: true });
};
