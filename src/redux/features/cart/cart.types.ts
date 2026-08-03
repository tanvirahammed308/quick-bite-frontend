import { IProduct } from "../product/product.types";


export interface ICartItem {
  product: string | IProduct;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface ICart {
  _id: string;
  user: string;
  items: ICartItem[];
  totalItems: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface ICartState {
  cart: ICart | null;
  loading: boolean;
  error: string | null;
}

export interface IAddToCartData {
  productId: string;
  quantity: number;
}

export interface IUpdateCartData {
  productId: string;
  quantity: number;
}

export interface IApiResponse {
  success: boolean;
  message?: string;
}

export interface ICartResponse extends IApiResponse {
  cart: ICart;
}