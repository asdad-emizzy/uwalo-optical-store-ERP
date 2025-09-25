import { Module } from '@nestjs/common';
import { OrdersController } from './interfaces/http/orders.controller';
import { OrderService } from './application/order-service';
import {
  ORDER_REPOSITORY_TOKEN,
  PATIENT_QUERY_SERVICE_TOKEN,
  PATIENT_SNAPSHOT_REPOSITORY_TOKEN,
} from './infrastructure/tokens';
import { InMemoryOrderRepository } from './infrastructure/in-memory/in-memory-order.repository';
import { InMemoryPatientSnapshotRepository } from './infrastructure/in-memory/in-memory-patient-snapshot.repository';
import { InMemoryPatientQueryService } from './infrastructure/in-memory/in-memory-patient-query.service';

const SAMPLE_PATIENTS = [
  {
    tenantId: 'tenant-1',
    patientId: 'patient-1',
    customerId: 'customer-1',
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
    notes: 'Prefers SMS updates',
  },
];

const SAMPLE_PRESCRIPTIONS = [
  {
    tenantId: 'tenant-1',
    prescriptionId: 'rx-1',
    patientId: 'patient-1',
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

@Module({
  controllers: [OrdersController],
  providers: [
    OrderService,
    { provide: ORDER_REPOSITORY_TOKEN, useClass: InMemoryOrderRepository },
    { provide: PATIENT_SNAPSHOT_REPOSITORY_TOKEN, useClass: InMemoryPatientSnapshotRepository },
    {
      provide: PATIENT_QUERY_SERVICE_TOKEN,
      useFactory: () => new InMemoryPatientQueryService({
        patients: SAMPLE_PATIENTS,
        prescriptions: SAMPLE_PRESCRIPTIONS,
      }),
    },
  ],
  exports: [OrderService],
})
export class OrdersModule {}
