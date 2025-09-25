"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const node_assert_1 = require("node:assert");
const order_service_1 = require("../src/modules/orders/application/order-service");
const in_memory_order_repository_1 = require("../src/modules/orders/infrastructure/in-memory/in-memory-order.repository");
const in_memory_patient_snapshot_repository_1 = require("../src/modules/orders/infrastructure/in-memory/in-memory-patient-snapshot.repository");
const in_memory_patient_query_service_1 = require("../src/modules/orders/infrastructure/in-memory/in-memory-patient-query.service");
const tenantId = 'tenant-1';
const patientId = 'patient-1';
const customerId = 'customer-1';
const prescriptionId = 'rx-1';
const patientRecords = [
    {
        tenantId,
        patientId,
        customerId,
        firstName: 'Jane',
        lastName: 'Doe',
        dateOfBirth: '1989-02-04',
        email: 'jane@example.com',
        phone: '+1-555-0100',
        billingAddress: {
            line1: '123 Main',
            city: 'Austin',
            state: 'TX',
            postalCode: '78701',
            country: 'US',
        },
        shippingAddress: {
            line1: '123 Main',
            city: 'Austin',
            state: 'TX',
            postalCode: '78701',
            country: 'US',
        },
    },
];
const prescriptionRecords = [
    {
        tenantId,
        prescriptionId,
        patientId,
        od: { sphere: -1.25, cylinder: -0.75, axis: 90 },
        os: { sphere: -1.0, cylinder: -0.5, axis: 85 },
        addPower: 0,
        pupillaryDistance: 63.5,
        segmentHeight: 18,
        writtenAt: '2023-08-01',
        expiresAt: '2025-08-01',
        doctorName: 'Dr. Smith',
        doctorLicense: 'TX12345',
    },
];
const makeService = () => {
    const orderRepo = new in_memory_order_repository_1.InMemoryOrderRepository();
    const patientSnapshotRepo = new in_memory_patient_snapshot_repository_1.InMemoryPatientSnapshotRepository();
    const patientQueryService = new in_memory_patient_query_service_1.InMemoryPatientQueryService({ patients: patientRecords, prescriptions: prescriptionRecords });
    return new order_service_1.OrderService(orderRepo, patientSnapshotRepo, patientQueryService);
};
(0, node_test_1.default)('creates an order with patient and prescription snapshots', async () => {
    const service = makeService();
    const order = await service.createOrder({
        tenantId,
        customerId,
        patientId,
        prescriptionId,
        captureLatestPrescription: false,
        contactEmail: 'custom@example.com',
        contactPhone: '+1-555-0101',
        shippingAddressId: 'ship-addr',
        billingAddressId: 'bill-addr',
        notes: 'Rush order',
        items: [
            {
                skuId: 'sku-1',
                quantity: 1,
                lensSelection: { design: 'sv', material: 'polycarbonate', coatings: ['ar'] },
            },
        ],
    });
    node_assert_1.strict.ok(order.id);
    node_assert_1.strict.equal(order.items.length, 1);
    node_assert_1.strict.equal(order.patientSnapshot?.firstName, 'Jane');
    node_assert_1.strict.equal(order.patientSnapshot?.email, 'custom@example.com');
    node_assert_1.strict.equal(order.prescriptionSnapshot?.prescriptionId, prescriptionId);
    node_assert_1.strict.equal(order.status, 'pending');
});
(0, node_test_1.default)('falls back to latest prescription when none specified', async () => {
    const service = makeService();
    const order = await service.createOrder({
        tenantId,
        customerId,
        patientId,
        captureLatestPrescription: true,
        shippingAddressId: 'ship-addr',
        billingAddressId: 'bill-addr',
        notes: undefined,
        items: [
            {
                skuId: 'sku-1',
                quantity: 1,
            },
        ],
    });
    node_assert_1.strict.equal(order.prescriptionSnapshot?.prescriptionId, prescriptionId);
    node_assert_1.strict.equal(order.status, 'pending');
});
(0, node_test_1.default)('returns order with patient snapshot by query', async () => {
    const service = makeService();
    const created = await service.createOrder({
        tenantId,
        customerId,
        patientId,
        captureLatestPrescription: true,
        shippingAddressId: 'ship-addr',
        billingAddressId: 'bill-addr',
        notes: undefined,
        items: [
            {
                skuId: 'sku-1',
                quantity: 1,
            },
        ],
    });
    const fetched = await service.getOrderWithPatient({ orderId: created.id, tenantId, includePrescription: true });
    node_assert_1.strict.equal(fetched.patientSnapshot?.patientId, patientId);
    node_assert_1.strict.equal(fetched.prescriptionSnapshot?.prescriptionId, prescriptionId);
});
//# sourceMappingURL=order-service.spec.js.map