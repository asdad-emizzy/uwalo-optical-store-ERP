import { PatientSnapshot } from '../domain/patient-snapshot';
import { PrescriptionSnapshot } from '../domain/prescription-snapshot';

export interface PatientSnapshotRepository {
  savePatientSnapshot(snapshot: PatientSnapshot): Promise<void>;
  savePrescriptionSnapshot(snapshot: PrescriptionSnapshot): Promise<void>;
  findPatientByOrderId(orderId: string, tenantId: string): Promise<PatientSnapshot | null>;
  findPrescriptionByOrderId(orderId: string, tenantId: string): Promise<PrescriptionSnapshot | null>;
}
