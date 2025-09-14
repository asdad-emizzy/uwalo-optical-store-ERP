# Architecture Overview

This document details the MVP architecture for the Optical Store & ERP project and the path to evolve it.

## Style

- Modular monolith for MVP with strict module boundaries and domain events (outbox pattern) to enable later service extraction.
- REST APIs for synchronous interactions; async domain events for cross-module workflows and integrations.

See also: `docs/architecture/modularity.md` for edition tiers and deployment profiles enabling small-to-large customer offerings.

## Context (C4: System)

```mermaid
flowchart LR
  Customer[Customer] -- Web/Mobile --> Storefront[Next.js Storefront]
  Storefront -- REST --> API[Backend API (Modular Monolith)]
  Admin[Backoffice/Admin] -- Web --> API
  API -- SQL --> PG[(PostgreSQL)]
  API -- Cache/Queue --> Redis[(Redis)]
  API -- Objects --> S3[(Object Storage)]
  API -- Index --> ES[(OpenSearch)]
  API -- Webhooks --> Providers[Payments/Tax/Shipping]
```

## Containers (C4: Container)

- Frontend: Next.js app for storefront and basic account management.
- Backend API: NestJS (or FastAPI) modular app exposing REST, orchestrating workflows.
- Worker: Background job processors for webhooks, emails, search indexing, labels.
- Databases: PostgreSQL (OLTP), Redis (cache/queues), OpenSearch (optional for search).
- Object Storage: Assets (images), Rx documents via signed URLs.

## Bounded Contexts

- Catalog: Products, frames, lens SKUs, variants, attributes, media.
- Pricing: Price lists, promotions, coupons, tax classes.
- Customers: Accounts, addresses, Rx docs, PD/seg height.
- Orders: Carts, checkout, order lifecycle, returns.
- Payments: Intents, captures/refunds, webhooks.
- Inventory: Stock, reservations, allocations.
- Fulfillment: Pick/pack/ship, labels, tracking.
- Procurement: Suppliers, POs, receiving.
- Lab: Rx validation, edging workflow, QA/remakes.
- Integrations: Provider adapters, webhooks, mapping.

## Data

- Start with single DB schema; module-prefixed tables (e.g., orders_orders, inventory_stock_levels).
- UUIDv7 for IDs; FK relationships within safe boundaries; avoid cross-module writes.
- Outbox table for domain events with exactly-once publishing via dedupe keys.

## APIs

- Versioned under `/api/v1` with standard CRUD + action endpoints.
- Idempotency keys for POST operations on checkout, payment, cancel/return.
- Pagination, filtering, sorting conventions; error shape with trace/correlation IDs.

## Events

- Examples: `orders.order.created`, `orders.order.paid`, `inventory.stock.decremented`, `fulfillment.shipment.shipped`, `lab.work_order.stage_changed`.
- Publish events from modules upon committed state changes; consumers process idempotently with retries and DLQ.

## Deployment

- Containers for frontend, api, worker; managed Postgres and Redis; optional OpenSearch managed.
- Environments: dev, staging, prod; blue/green or rolling; migrations in CI.

## Security

- OIDC-based auth, MFA for staff, RBAC/ABAC for admin actions.
- PII and Rx documents protected; encryption at rest; signed URLs; audit trails for sensitive access.

## Observability

- OpenTelemetry traces, structured logs with correlation IDs, RED (requests/errors/duration) metrics for APIs, queue metrics for workers.

## Key Decisions (Draft)

1. Backend framework: NestJS vs FastAPI.
2. Message transport: Redis Streams vs RabbitMQ/Kafka (post-MVP).
3. Search: enable OpenSearch at MVP or defer.
4. Multi-tenant support at DB level vs app-level scoping.
