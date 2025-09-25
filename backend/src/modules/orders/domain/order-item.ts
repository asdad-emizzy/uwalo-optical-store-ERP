export interface OrderItem {
  id: string;
  orderId: string;
  skuId: string;
  quantity: number;
  lensSelection?: LensSelection;
  frameSelection?: FrameSelection;
}

export interface LensSelection {
  design: string;
  material: string;
  coatings: string[];
  tint?: string;
  notes?: string;
}

export interface FrameSelection {
  frameId: string;
  color?: string;
  size?: string;
}
