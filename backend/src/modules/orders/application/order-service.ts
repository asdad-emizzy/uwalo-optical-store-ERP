import { randomUUID } from 'crypto';
import { Inject, Injectable } from '@nestjs/common';
import { OrderAggregate } from '../domain/order.aggregate';
import { OrderItem } from '../domain/order-item';
import { OrderStatus } from '../domain/order-status';
import { PatientSnapshot } from '../domain/patient-snapshot';
import { PrescriptionSnapshot } from '../domain/prescription-snapshot';
import { CreateOrderCommand, GetOrderWithPatientQuery } from './commands';
import { OrderRepository } from '../infrastructure/order-repository';
import {
  PatientQueryService,
  PatientSnapshotDraft,
  PrescriptionSnapshotDraft,
} from '../infrastructure/patient-query.service';
import { PatientSnapshotRepository } from '../infrastructure/patient-snapshot.repository';
import {
  ORDER_REPOSITORY_TOKEN,
  PATIENT_QUERY_SERVICE_TOKEN,
  PATIENT_SNAPSHOT_REPOSITORY_TOKEN,
} from '../infrastructure/tokens';

export interface OrderApplicationService {
  createOrder(command: CreateOrderCommand): Promise<OrderAggregate>;
  getOrderWithPatient(query: GetOrderWithPatientQuery): Promise<OrderAggregate>;
}

@Injectable()
export class OrderService implements OrderApplicationService {
  constructor(
    @Inject(ORDER_REPOSITORY_TOKEN) private readonly orderRepository: OrderRepository,
    @Inject(PATIENT_SNAPSHOT_REPOSITORY_TOKEN)
    private readonly patientSnapshotRepository: PatientSnapshotRepository,
    @Inject(PATIENT_QUERY_SERVICE_TOKEN)
    private readonly patientQueryService: PatientQueryService
  ) {}

  async createOrder(command: CreateOrderCommand): Promise<OrderAggregate> {
    const orderId = this.orderRepository.nextIdentity();
    const nowIso = new Date().toISOString();

    const items: OrderItem[] = command.items.map((item) => ({
      id: randomUUID(),
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

    const order: OrderAggregate = {
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

  async getOrderWithPatient(query: GetOrderWithPatientQuery): Promise<OrderAggregate> {
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

  private initialStatus(command: CreateOrderCommand): OrderStatus {
    return command.captureLatestPrescription || command.prescriptionId ? 'pending' : 'draft';
  }

  private buildPatientSnapshot(
    orderId: string,
    tenantId: string,
    draft: PatientSnapshotDraft
  ): PatientSnapshot {
    return {
      id: randomUUID(),
      orderId,
      tenantId,
      capturedAt: new Date().toISOString(),
      ...draft,
    };
  }

  private async resolvePrescriptionSnapshot(
    orderId: string,
    tenantId: string,
    command: CreateOrderCommand
  ): Promise<PrescriptionSnapshot | null> {
    let draft: PrescriptionSnapshotDraft | null = null;

    if (command.prescriptionId) {
      draft = await this.patientQueryService.getPrescriptionSnapshotDraft(command.prescriptionId, {
        tenantId,
      });
    } else if (command.captureLatestPrescription) {
      draft = await this.patientQueryService.getLatestPrescriptionSnapshotDraft(command.patientId, {
        tenantId,
      });
    }

    if (!draft) {
      return null;
    }

    return {
      id: randomUUID(),
      orderId,
      tenantId,
      capturedAt: new Date().toISOString(),
      ...draft,
    };
  }
}
