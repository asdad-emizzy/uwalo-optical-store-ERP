"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const crypto_1 = require("crypto");
class OrderService {
    constructor(orderRepository, patientSnapshotRepository, patientQueryService) {
        this.orderRepository = orderRepository;
        this.patientSnapshotRepository = patientSnapshotRepository;
        this.patientQueryService = patientQueryService;
    }
    async createOrder(command) {
        const orderId = this.orderRepository.nextIdentity();
        const nowIso = new Date().toISOString();
        const items = command.items.map((item) => ({
            id: (0, crypto_1.randomUUID)(),
            orderId,
            skuId: item.skuId,
            quantity: item.quantity,
            lensSelection: item.lensSelection,
            frameSelection: item.frameSelection,
        }));
        const patientDraft = await this.patientQueryService.getPatientSnapshotDraft(command.patientId, {
            tenantId: command.tenantId,
            billingAddressId: command.billingAddressId,
            shippingAddressId: command.shippingAddressId,
            contactEmail: command.contactEmail,
            contactPhone: command.contactPhone,
            notes: command.notes,
        });
        const patientSnapshot = this.buildPatientSnapshot(orderId, command.tenantId, patientDraft);
        const prescriptionSnapshot = await this.resolvePrescriptionSnapshot(orderId, command.tenantId, command);
        const order = {
            id: orderId,
            tenantId: command.tenantId,
            customerId: command.customerId,
            status: this.initialStatus(command),
            currencyCode: 'USD',
            subtotalCents: 0,
            taxCents: 0,
            totalCents: 0,
            createdAt: nowIso,
            updatedAt: nowIso,
            items,
            patientSnapshot,
            prescriptionSnapshot: prescriptionSnapshot ?? undefined,
        };
        const persisted = await this.orderRepository.create(order);
        await this.patientSnapshotRepository.savePatientSnapshot(patientSnapshot);
        if (prescriptionSnapshot) {
            await this.patientSnapshotRepository.savePrescriptionSnapshot(prescriptionSnapshot);
        }
        return {
            ...persisted,
            patientSnapshot,
            prescriptionSnapshot: prescriptionSnapshot ?? undefined,
        };
    }
    async getOrderWithPatient(query) {
        const order = await this.orderRepository.findById(query.orderId, query.tenantId);
        if (!order) {
            throw new Error(`Order ${query.orderId} not found for tenant ${query.tenantId}`);
        }
        const patientSnapshot = await this.patientSnapshotRepository.findPatientByOrderId(query.orderId, query.tenantId);
        const prescriptionSnapshot = query.includePrescription
            ? await this.patientSnapshotRepository.findPrescriptionByOrderId(query.orderId, query.tenantId)
            : null;
        return {
            ...order,
            patientSnapshot: patientSnapshot ?? undefined,
            prescriptionSnapshot: prescriptionSnapshot ?? undefined,
        };
    }
    initialStatus(command) {
        return command.captureLatestPrescription || command.prescriptionId ? 'pending' : 'draft';
    }
    buildPatientSnapshot(orderId, tenantId, draft) {
        return {
            id: (0, crypto_1.randomUUID)(),
            orderId,
            tenantId,
            capturedAt: new Date().toISOString(),
            ...draft,
        };
    }
    async resolvePrescriptionSnapshot(orderId, tenantId, command) {
        let draft = null;
        if (command.prescriptionId) {
            draft = await this.patientQueryService.getPrescriptionSnapshotDraft(command.prescriptionId, {
                tenantId,
            });
        }
        else if (command.captureLatestPrescription) {
            draft = await this.patientQueryService.getLatestPrescriptionSnapshotDraft(command.patientId, {
                tenantId,
            });
        }
        if (!draft) {
            return null;
        }
        return {
            id: (0, crypto_1.randomUUID)(),
            orderId,
            tenantId,
            capturedAt: new Date().toISOString(),
            ...draft,
        };
    }
}
exports.OrderService = OrderService;
//# sourceMappingURL=order-service.js.map