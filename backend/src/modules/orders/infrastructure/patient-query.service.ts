import { PatientSnapshot } from '../domain/patient-snapshot';
import { PrescriptionSnapshot } from '../domain/prescription-snapshot';

export type PatientSnapshotDraft = Omit<PatientSnapshot, 'id' | 'orderId' | 'capturedAt' | 'tenantId'>;
export type PrescriptionSnapshotDraft = Omit<PrescriptionSnapshot, 'id' | 'orderId' | 'capturedAt' | 'tenantId'>;

export interface PatientQueryService {
  getPatientSnapshotDraft(
    patientId: string,
    options: {
      tenantId: string;
      billingAddressId: string;
      shippingAddressId: string;
      contactEmail?: string;
      contactPhone?: string;
      notes?: string;
    }
  ): Promise<PatientSnapshotDraft>;

  getPrescriptionSnapshotDraft(
    prescriptionId: string,
    options: { tenantId: string }
  ): Promise<PrescriptionSnapshotDraft | null>;

  getLatestPrescriptionSnapshotDraft(
    patientId: string,
    options: { tenantId: string }
  ): Promise<PrescriptionSnapshotDraft | null>;
}
