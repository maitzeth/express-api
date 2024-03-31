import ProductModel from './products.model';
import { Product } from '@src/types';

export function getProducts() {
  return ProductModel.find();
};

export function createProduct(product: Product) {
  return new ProductModel({ ...product }).save();
};

export function getProductById(id: string | undefined) {
  return ProductModel.findById(id);
};

export function deleteProductById(id: string | undefined) {
  return ProductModel.findByIdAndDelete(id);
};

export function updateProductById(id: string | undefined, product: Product) {
  return ProductModel.findByIdAndUpdate(id, product, { new: true });
};

export function saveImageUrl(id: string, imageUrl: string) {
  return ProductModel.findByIdAndUpdate(id, { imageUrl }, { new: true });
};
