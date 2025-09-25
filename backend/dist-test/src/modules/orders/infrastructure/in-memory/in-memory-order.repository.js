"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryOrderRepository = void 0;
const crypto_1 = require("crypto");
class InMemoryOrderRepository {
    constructor() {
        this.orders = new Map();
    }
    nextIdentity() {
        return (0, crypto_1.randomUUID)();
    }
    async create(order) {
        this.orders.set(order.id, order);
        return order;
    }
    async findById(orderId, tenantId) {
        const order = this.orders.get(orderId);
        if (!order) {
            return null;
        }
        if (order.tenantId !== tenantId) {
            return null;
        }
        return order;
    }
}
exports.InMemoryOrderRepository = InMemoryOrderRepository;
//# sourceMappingURL=in-memory-order.repository.js.map