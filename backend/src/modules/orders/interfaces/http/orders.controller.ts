import { Request } from 'express';
import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { OrderService } from '../../application/order-service';
import { CreateOrderRequestDto } from '../../dto/create-order.dto';
import { OrderResponseDto } from '../../dto/order-response.dto';
import { RequestContext } from './request-context';
import { GetOrderWithPatientQuery } from '../../application/commands';

@Controller('orders')
export class OrdersController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(
    @Body() payload: CreateOrderRequestDto,
    @Req() req: Request
  ): Promise<OrderResponseDto> {
    const context = this.buildContext(req);
    const command = this.mapToCommand(payload, context);
    return this.orderService.createOrder(command);
  }

  @Get(':orderId')
  async getOrder(
    @Param('orderId') orderId: string,
    @Req() req: Request,
    @Query('include') include?: string
  ): Promise<OrderResponseDto> {
    const context = this.buildContext(req);
    const includes = this.parseCsv(include);

    const query: GetOrderWithPatientQuery = {
      orderId,
      tenantId: context.tenantId,
      includePrescription: includes.includes('prescription'),
    };

    return this.orderService.getOrderWithPatient(query);
  }

  @Get(':orderId/patient')
  async getOrderPatient(
    @Param('orderId') orderId: string,
    @Req() req: Request
  ): Promise<OrderResponseDto> {
    const context = this.buildContext(req);
    this.ensureScope(context, 'orders:patient:read');

    return this.orderService.getOrderWithPatient({
      orderId,
      tenantId: context.tenantId,
      includePrescription: true,
    });
  }

  private mapToCommand(payload: CreateOrderRequestDto, context: RequestContext) {
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

  private buildContext(req: Request): RequestContext {
    const tenantId = req.header('x-tenant-id');
    if (!tenantId) {
      throw new BadRequestException('Missing x-tenant-id header');
    }

    const userId = req.header('x-user-id') ?? 'system';
    const roles = this.parseCsv(req.header('x-roles'));
    const scopes = this.parseCsv(req.header('x-scopes'));

    return {
      tenantId,
      userId,
      roles,
      scopes,
    };
  }

  private ensureScope(context: RequestContext, scope: string) {
    if (!context.scopes.includes(scope)) {
      throw new ForbiddenException(`Missing scope: ${scope}`);
    }
  }

  private parseCsv(value?: string | string[]): string[] {
    if (!value) {
      return [];
    }

    const raw = Array.isArray(value) ? value.join(',') : value;
    return raw
      .split(',')
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
  }
}
