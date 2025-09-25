"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryPatientSnapshotRepository = void 0;
const makeKey = (tenantId, orderId) => `${tenantId}:${orderId}`;
class InMemoryPatientSnapshotRepository {
    constructor() {
        this.patientSnapshots = new Map();
        this.prescriptionSnapshots = new Map();
    }
    async savePatientSnapshot(snapshot) {
        const key = makeKey(snapshot.tenantId, snapshot.orderId);
        this.patientSnapshots.set(key, snapshot);
    }
    async savePrescriptionSnapshot(snapshot) {
        const key = makeKey(snapshot.tenantId, snapshot.orderId);
        this.prescriptionSnapshots.set(key, snapshot);
    }
    async findPatientByOrderId(orderId, tenantId) {
        const key = makeKey(tenantId, orderId);
        return this.patientSnapshots.get(key) ?? null;
    }
    async findPrescriptionByOrderId(orderId, tenantId) {
        const key = makeKey(tenantId, orderId);
        return this.prescriptionSnapshots.get(key) ?? null;
    }
}
exports.InMemoryPatientSnapshotRepository = InMemoryPatientSnapshotRepository;
//# sourceMappingURL=in-memory-patient-snapshot.repository.js.map