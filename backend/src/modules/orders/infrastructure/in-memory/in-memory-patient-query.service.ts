import { PatientSnapshotDraft, PatientQueryService, PrescriptionSnapshotDraft } from '../patient-query.service';

interface PatientRecord {
  tenantId: string;
  patientId: string;
  customerId: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  email?: string;
  phone?: string;
  billingAddress: PatientSnapshotDraft['billingAddress'];
  shippingAddress: PatientSnapshotDraft['shippingAddress'];
  notes?: string;
}

interface PrescriptionRecord extends PrescriptionSnapshotDraft {
  tenantId: string;
  prescriptionId: string;
  patientId: string;
}

export class InMemoryPatientQueryService implements PatientQueryService {
  private readonly patients: PatientRecord[];
  private readonly prescriptions: PrescriptionRecord[];

  constructor(params?: { patients?: PatientRecord[]; prescriptions?: PrescriptionRecord[] }) {
    this.patients = params?.patients ?? [];
    this.prescriptions = params?.prescriptions ?? [];
  }

  async getPatientSnapshotDraft(
    patientId: string,
    options: {
      tenantId: string;
      billingAddressId: string;
      shippingAddressId: string;
      contactEmail?: string;
      contactPhone?: string;
      notes?: string;
    }
  ): Promise<PatientSnapshotDraft> {
    const patient = this.patients.find((p) => p.patientId === patientId && p.tenantId === options.tenantId);
    if (!patient) {
      throw new Error(`Patient ${patientId} not found for tenant ${options.tenantId}`);
    }

    return {
      patientId: patient.patientId,
      customerId: patient.customerId,
      firstName: patient.firstName,
      lastName: patient.lastName,
      dateOfBirth: patient.dateOfBirth,
      email: options.contactEmail ?? patient.email,
      phone: options.contactPhone ?? patient.phone,
      billingAddress: patient.billingAddress,
      shippingAddress: patient.shippingAddress,
      notes: options.notes ?? patient.notes,
    };
  }

  async getPrescriptionSnapshotDraft(
    prescriptionId: string,
    options: { tenantId: string }
  ): Promise<PrescriptionSnapshotDraft | null> {
    const prescription = this.prescriptions.find(
      (p) => p.prescriptionId === prescriptionId && p.tenantId === options.tenantId
    );
    if (!prescription) {
      return null;
    }

    const { tenantId, ...rest } = prescription;
    return {
      ...rest,
    };
  }

  async getLatestPrescriptionSnapshotDraft(
    patientId: string,
    options: { tenantId: string }
  ): Promise<PrescriptionSnapshotDraft | null> {
    const matches = this.prescriptions
      .filter((p) => p.patientId === patientId && p.tenantId === options.tenantId)
      .sort((a, b) => (a.writtenAt < b.writtenAt ? 1 : -1));

    if (matches.length === 0) {
      return null;
    }

    const { tenantId, ...rest } = matches[0];
    return {
      ...rest,
    };
  }
}
