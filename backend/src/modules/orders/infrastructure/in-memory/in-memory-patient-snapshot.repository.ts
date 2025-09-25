import { PatientSnapshot } from '../../domain/patient-snapshot';
import { PrescriptionSnapshot } from '../../domain/prescription-snapshot';
import { PatientSnapshotRepository } from '../patient-snapshot.repository';

const makeKey = (tenantId: string, orderId: string) => `${tenantId}:${orderId}`;

export class InMemoryPatientSnapshotRepository implements PatientSnapshotRepository {
  private readonly patientSnapshots = new Map<string, PatientSnapshot>();
  private readonly prescriptionSnapshots = new Map<string, PrescriptionSnapshot>();

  async savePatientSnapshot(snapshot: PatientSnapshot): Promise<void> {
    const key = makeKey(snapshot.tenantId, snapshot.orderId);
    this.patientSnapshots.set(key, snapshot);
  }

  async savePrescriptionSnapshot(snapshot: PrescriptionSnapshot): Promise<void> {
    const key = makeKey(snapshot.tenantId, snapshot.orderId);
    this.prescriptionSnapshots.set(key, snapshot);
  }

  async findPatientByOrderId(orderId: string, tenantId: string): Promise<PatientSnapshot | null> {
    const key = makeKey(tenantId, orderId);
    return this.patientSnapshots.get(key) ?? null;
  }

  async findPrescriptionByOrderId(orderId: string, tenantId: string): Promise<PrescriptionSnapshot | null> {
    const key = makeKey(tenantId, orderId);
    return this.prescriptionSnapshots.get(key) ?? null;
  }
}
