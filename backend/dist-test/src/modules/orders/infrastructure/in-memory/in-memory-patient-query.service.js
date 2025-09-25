"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryPatientQueryService = void 0;
class InMemoryPatientQueryService {
    constructor(params) {
        this.patients = params?.patients ?? [];
        this.prescriptions = params?.prescriptions ?? [];
    }
    async getPatientSnapshotDraft(patientId, options) {
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
    async getPrescriptionSnapshotDraft(prescriptionId, options) {
        const prescription = this.prescriptions.find((p) => p.prescriptionId === prescriptionId && p.tenantId === options.tenantId);
        if (!prescription) {
            return null;
        }
        const { tenantId, ...rest } = prescription;
        return {
            ...rest,
        };
    }
    async getLatestPrescriptionSnapshotDraft(patientId, options) {
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
exports.InMemoryPatientQueryService = InMemoryPatientQueryService;
//# sourceMappingURL=in-memory-patient-query.service.js.map