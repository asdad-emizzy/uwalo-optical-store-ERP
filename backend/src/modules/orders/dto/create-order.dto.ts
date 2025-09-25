import { LensSelection, FrameSelection } from '../domain/order-item';

export interface CreateOrderRequestDto {
  customerId: string;
  patientId: string;
  prescriptionId?: string;
  captureLatestPrescription?: boolean;
  contactEmail?: string;
  contactPhone?: string;
  shippingAddressId: string;
  billingAddressId: string;
  notes?: string;
  items: Array<{
    skuId: string;
    quantity: number;
    lensSelection?: LensSelection;
    frameSelection?: FrameSelection;
  }>;
  metadata?: Record<string, unknown>;
}
