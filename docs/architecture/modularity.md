# Modularity & Editions

Design goal: Offer a small, simple system for small customers and scale up to complex capabilities for larger customers without replatforming. This is achieved through strict module boundaries, feature flags/entitlements, and progressive deployment profiles.

## Module Layers

- Core (Starter)
  - Auth & Users, RBAC (basic)
  - Catalog (frames, lenses), Media
  - Pricing (basic lists), Tax classes (static or single provider)
  - Cart & Checkout, Orders
  - Payments (one provider), Notifications (email)
  - Inventory (single location), Shipping (two carriers), Returns (basic)
- Growth (Standard)
  - Promotions & Coupons, Search (OpenSearch)
  - Address Validation, Tax Integration (Avalara/TaxJar)
  - Multi-warehouse inventory, Transfer & Allocation rules
  - Returns/RMA workbench, Refund orchestration
  - Procurement (suppliers, POs) – basic
  - Warehouse basics (bins, pick/pack/ship)
- Advanced (Pro)
  - Advanced Pricing (price lists, customer groups), B2B (orgs, quotes)
  - Multi-brand/tenant scoping, Catalog localization
  - Analytics dashboards, Event streaming to analytics sink
  - CRM/ticketing integration, Webhooks for partners
  - Supplier EDI (catalogs, POs)
  - Optical Lab (basic: validation, edging workflow)
- Specialized (Enterprise)
  - Optical Lab Automation (work orders, QA/remakes, exceptions)
  - Forecasting/Planning (replenishment, lead times)
  - Data warehouse connectors (CDC), SSO for staff, Audit & compliance controls

Notes
- Each layer only depends on lower layers. Advanced modules are optional and entitlements-gated.

## Deployment Profiles (Progressive)

- P1: Single-Process Monolith
  - Backend API + Jobs in one process/container; Postgres, Redis; optional search off.
  - Lowest cost/ops. Suitable for Starter.
- P2: Monolith + Worker Split
  - API and Worker separated; managed Postgres/Redis; optional OpenSearch.
  - Better reliability; fits Starter/Standard.
- P3: Strangler Extractions
  - Extract high-churn/IO modules behind stable APIs/events:
    - Search service, Payments/Webhooks handler, Fulfillment/Shipping service, Lab service.
  - Event bus (Redis Streams/RabbitMQ) introduced; API remains canonical.
- P4: Service Suite
  - Clear service boundaries per bounded context; API gateway; contract tests; schema-per-service.
  - Fits Pro/Enterprise, multi-team scale.

## Module Boundaries & Dependencies

- Acyclic dependencies between modules; communicate via APIs/domain events.
- Allowed coupling: Orders -> Pricing (query), Orders -> Inventory (reserve via API), Lab <- Orders (events), Fulfillment <- Orders (events).
- Forbidden: direct cross-module DB writes; instead use application services and events.

## Data Segmentation

- Start single database; module-prefixed tables (e.g., `orders_orders`, `inventory_stock_levels`).
- Outbox table per module for domain events with dedupe key and status.
- Prepare for per-module schemas; later split to service-owned databases (extract with CDC/backfill).
- Tenant scoping: include `tenant_id` in all module tables; enforce in repository layer.

## Feature Flags & Entitlements

- Feature flags: runtime toggles for beta/rollout (e.g., `search.enabled`, `rma.enabled`).
- Entitlements: plan-based gates (Starter/Standard/Pro/Enterprise) checked at request boundaries and in UI navigation.
- API behavior when disabled: return 404/403 for non-entitled endpoints; avoid leaking presence of features.

## Provider Plugins

- Adapters as plugins with a stable interface: Payments, Tax, Shipping, Address, EDI.
- Registry-based resolution by tenant/brand; supports multiple providers concurrently.
- Contract tests per adapter to ensure interchangeability.

## Scaling & Resilience Knobs

- Caching: catalog and availability with short TTL; cache-busting events.
- Job queues: webhook handling, search indexing, emails, label creation.
- Idempotency: keys for checkout/payments; dedupe in outbox and consumer stores.
- Backpressure: queue limits, circuit breakers around providers, DLQs for poison messages.

## Extraction Playbook (Monolith -> Service)

1. Stabilize module API and internal events; add contract tests.
2. Introduce outbox for module events if not present; ensure idempotency.
3. Carve read model (optional) to reduce chatty calls.
4. Spin up service with same API; dual-write events temporarily (feature flag controlled).
5. Backfill data via CDC or snapshot + catch-up from event stream.
6. Cut traffic via router/gateway; monitor SLOs; remove dual writes.

## Edition Matrix (Example)

- Starter: Core modules only; P1 or P2 deployment; single warehouse; one payment and two carriers.
- Standard: +Promotions, Search, Multi-warehouse, RMA, Address/Tax integrations; P2.
- Pro: +Advanced Pricing, B2B, Analytics, CRM, EDI, Lab (basic); P3 recommended.
- Enterprise: +Lab Automation, Forecasting, DW connectors, strict compliance; P3/P4.

## Repository Layout Implications

- Keep modules physically separated (`/backend/modules/{catalog|pricing|...}`) with explicit DI boundaries.
- Place jobs next to modules (e.g., `/backend/modules/orders/jobs/*`).
- Central `interfaces/` and `events/` packages to share contracts between API and workers.

