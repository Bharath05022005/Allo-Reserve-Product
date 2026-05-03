// Shared API response types for frontend consumption

export type StockData = {
  id: string;
  productId: string;
  warehouseId: string;
  totalUnits: number;
  reservedUnits: number;
  availableUnits: number;
  warehouse: {
    id: string;
    name: string;
    location: string;
  };
};

export type ProductData = {
  id: string;
  name: string;
  description: string | null;
  sku: string;
  price: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  stocks: StockData[];
};

export type ReservationData = {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  status: "PENDING" | "CONFIRMED" | "RELEASED";
  expiresAt: string;
  idempotencyKey: string | null;
  createdAt: string;
  updatedAt: string;
  product: {
    id: string;
    name: string;
    sku: string;
    price: string;
    imageUrl: string | null;
  };
  warehouse: {
    id: string;
    name: string;
    location: string;
  };
};

export type ApiResponse<T> = {
  data: T;
  error?: never;
} | {
  data?: never;
  error: string;
  code?: string;
};
