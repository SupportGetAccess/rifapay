export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

export interface CartItem {
  rifaSlug: string;
  rifaTitle: string;
  pricePerNumber: number;
  numbers: number[];
  subtotal: number;
}

export interface CartSession {
  items: CartItem[];
  total: number;
  reservedUntil: string;
}
