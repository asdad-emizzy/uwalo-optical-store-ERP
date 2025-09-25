"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersController = void 0;
class OrdersController {
    constructor(orderService) {
        this.orderService = orderService;
    }
    async createOrder(payload, context) {
        const command = this.mapToCommand(payload, context);
        const aggregate = await this.orderService.createOrder(command);
        return aggregate;
    }
    async getOrder(orderId, context, options) {
        const query = {
            orderId,
            tenantId: context.tenantId,
            includePrescription: options?.include?.includes('prescription') ?? false,
        };
        return this.orderService.getOrderWithPatient(query);
    }
    async getOrderPatient(orderId, context) {
        this.ensureScope(context, 'orders:patient:read');
        const aggregate = await this.orderService.getOrderWithPatient({
            orderId,
            tenantId: context.tenantId,
            includePrescription: true,
        });
        return aggregate;
    }
    mapToCommand(payload, context) {
        return {
            tenantId: context.tenantId,
            customerId: payload.customerId,
            patientId: payload.patientId,
            prescriptionId: payload.prescriptionId,
            captureLatestPrescription: payload.captureLatestPrescription ?? false,
            contactEmail: payload.contactEmail,
            contactPhone: payload.contactPhone,
            shippingAddressId: payload.shippingAddressId,
            billingAddressId: payload.billingAddressId,
            notes: payload.notes,
            items: payload.items,
            metadata: payload.metadata,
            idempotencyKey: undefined,
        };
    }
    ensureScope(context, scope) {
        if (!context.scopes.includes(scope)) {
            throw new Error('Forbidden: missing scope');
        }
    }
}
exports.OrdersController = OrdersController;
//# sourceMappingURL=orders.controller.js.map