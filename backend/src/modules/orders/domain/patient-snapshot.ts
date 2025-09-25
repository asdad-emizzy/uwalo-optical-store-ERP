export interface PatientSnapshot {
  id: string;
  orderId: string;
  tenantId: string;
  patientId: string;
  customerId: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  email?: string;
  phone?: string;
  billingAddress: Address;
  shippingAddress: Address;
  notes?: string;
  capturedAt: string;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}
