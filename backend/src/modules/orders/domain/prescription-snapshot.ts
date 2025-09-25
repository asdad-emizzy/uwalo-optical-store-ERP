export interface EyePrescription {
  sphere: number;
  cylinder: number;
  axis: number;
  prism?: {
    horizontal?: number;
    vertical?: number;
    base?: 'up' | 'down' | 'in' | 'out';
  };
}

export interface PrescriptionSnapshot {
  id: string;
  orderId: string;
  tenantId: string;
  patientId: string;
  prescriptionId: string;
  od: EyePrescription;
  os: EyePrescription;
  addPower?: number;
  pupillaryDistance?: number;
  segmentHeight?: number;
  writtenAt: string;
  expiresAt?: string;
  doctorName?: string;
  doctorLicense?: string;
  capturedAt: string;
}
