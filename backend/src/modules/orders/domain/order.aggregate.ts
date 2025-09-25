import { OrderStatus } from './order-status';
import { OrderItem } from './order-item';
import { PatientSnapshot } from './patient-snapshot';
import { PrescriptionSnapshot } from './prescription-snapshot';

export interface OrderAggregate {
  id: string;
  tenantId: string;
  customerId: string;
  status: OrderStatus;
  currencyCode: string;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  patientSnapshot?: PatientSnapshot;
  prescriptionSnapshot?: PrescriptionSnapshot;
}
