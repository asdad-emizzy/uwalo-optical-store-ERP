# Optical ERP User Guide (TOGAF-Aligned)

## Document Purpose

Provide business stakeholders and end-users with guidance on how the Optical ERP solution supports daily operations, mapped to the TOGAF Architecture Development Method (ADM).

## Audience

- Store associates and lab technicians
- Store managers and regional supervisors
- Customer service representatives
- E-commerce operations and merchandising teams
- Business transformation sponsors

## Stakeholder Concerns & Requirements

| Stakeholder | Concerns | Requirements |
|-------------|----------|--------------|
| Store Associate | Fast checkout, accurate Rx capture | Guided order workflow, minimal data re-entry |
| Lab Technician | Clear queue visibility, measurement accuracy | Rx validation checklist, stage transitions |
| Store Manager | Compliance, KPI tracking | Role-based dashboards, approval workflows |
| Customer Support | Omnichannel visibility, remakes | Unified order timeline, RMA tooling |
| Transformation Lead | Adoption, ROI | Training readiness, phased rollout plan |

## ADM Phase Mapping

| ADM Phase | User Guide Emphasis |
|-----------|--------------------|
| Architecture Vision | Business value proposition and scope of the Optical ERP |
| Business Architecture | User roles, capabilities, and business processes |
| Information Systems Architecture | Key data, applications, and user-facing integrations |
| Technology Architecture | Channels, authentication, and operational considerations |
| Opportunities & Solutions | Release roadmap and feature enablement strategy |
| Migration Planning | Adoption phases for stores and channels |
| Implementation Governance | Training, access controls, and compliance |
| Architecture Change Management | Continuous improvement and feedback loops |

## Architecture Vision

- **Objective**: Deliver a unified platform covering optical retail POS, e-commerce, prescription management, order lifecycle, and lab coordination.
- **Value**: Reduce manual double-entry, improve Rx compliance, expose real-time inventory, and streamline omnichannel fulfillment.
- **Scope**: Multi-tenant modular monolith covering Catalog, Customers, Orders, Inventory, Lab, Fulfillment, and Integrations contexts.
- **Success Metrics**: 30% faster order processing, 20% reduction in remake rate, same-day lab turnaround for 80% of orders, one unified customer record per patient.

## Business Architecture

### Personas & Responsibilities

- **Store Associate**: Builds carts, records prescriptions, collects payments, schedules pickups.
- **Lab Technician**: Reviews Rx, manages edging workflow, logs QA checks, marks orders ready.
- **Store Manager**: Monitors KPIs, approves adjustments/returns, manages staff access.
- **Customer Support**: Answers inquiries, tracks shipments, triggers RMAs, coordinates remakes.
- **Merchandiser**: Maintains product catalog, pricing, promotions, and assortments.
- **Optometrist (optional)**: Uploads signed prescriptions, validates measurements.

### Business Capability Model

1. **Customer Management** – Patient profiles, contact preferences, consent tracking.
2. **Prescription Management** – Rx intake, validation, expiration tracking, audit trails.
3. **Order Orchestration** – Cart, checkout, payment capture, status transitions.
4. **Lab Operations** – Work order staging, edging workflow, QA and remakes.
   - **Printable Work Orders**: Each order produces a standardized PDF/thermal ticket with frame model, lens geometry, edging instructions, tint/coating requirements, and QR code referencing the digital work order. Associates reprint from the lab queue when adjustments are made to guarantee traceability.
   - **3D Frame Print Option** (future-ready): When a tenant enables additive manufacturing, work orders include STL references and printer settings for supported materials (acetate/nylon). The system enforces calibration checks before print approval.
   - **Supported Printers**: Optimized for Epson TM series thermal/receipt printers—specifically the TM-T88VII model for its high-speed lab ticket throughput—and equivalent ESC/POS-compatible devices to keep lab benches compact; optional full-page PDF export for A4/Letter laser printers when extended schematics are required.
5. **Inventory Control** – Stock levels, reservations, transfer orders, receiving.
6. **Fulfillment & Logistics** – Pick/pack/ship, carrier integration, delivery confirmation.
7. **Returns & Service** – RMA handling, credit/refund issuance, customer communication.

### Key Business Processes (BPMN Summaries)

- **Order Capture**
  1. Identify patient and applicable prescriptions.
  2. Configure lens/frame options with pricing.
  3. Capture payment authorization and generate order snapshot.
- **Lab Processing**
  1. Validate Rx vs product configuration.
  2. Edge lenses, assemble frames, run QA checklist.
  3. Print or scan lab work order ticket with barcode/QR to confirm frame and lens match prior to assembly.
  4. Handoff to fulfillment or store pickup.
- **Returns & Remakes**
  1. Initiate return with reason code and authorization.
  2. Inspect product, trigger remake if needed.
  3. Issue refund or exchange and close case.

### Business Rules & Controls

- Orders cannot progress to lab without valid Rx snapshot captured within last 24 months.
- Patient communication defaults to consented channel (email/SMS) and logs message history.
- Returns beyond 30 days require manager override and reason justification.
- Lab QA failures automatically reopen order and notify manager for remediation.

## Information Systems Architecture

### Application Landscape (User View)

- **Storefront (Next.js)**: Product discovery, virtual try-on integration, schedule appointments.
- **Point-of-Sale Portal**: Guided order entry, patient lookup, payment capture.
- **Backoffice Admin**: Order queues, lab dashboard, inventory allocation, reporting.
- **Customer Self-Service**: Order tracking, Rx uploads, reorders, support tickets.

### Data Views

- **Patient Snapshot**: Order-bound snapshot of demographics, Rx details, measurements.
- **Order Timeline**: Chronological events (created, paid, in lab, fulfilled, delivered).
- **Lab Queue Board**: Stage-specific work-in-progress counts, SLA timers, blockers.
- **Inventory Exposure**: Store vs warehouse availability, reservations, pending transfers.

### User Interactions & Integrations

- Payment capture with tokenization (Stripe/Adyen).
- Tax and shipping estimations via third-party services (Avalara, ShipEngine).
- Notifications through email/SMS providers with templated messaging.
- Optional EHR integration to import validated prescriptions.

### Security & Privacy

- Role-based access control with least privilege by persona.
- Field-level masking for PHI in UI unless scope `orders:patient:read` granted.
- Audit logging for all patient data reads and edits.
- Consent records accessible to customer support for regulatory reporting.

## Technology Architecture (User-Centric)

- **Access Channels**: Responsive web (Next.js), tablet-optimized POS, optional kiosk.
- **Authentication**: OIDC SSO for staff with MFA; customer account login with passwordless mail OTP.
- **Offline Readiness**: POS uses local storage queue for orders/payments when offline; syncs once connectivity restores.
- **Performance Goals**: Sub-2s page loads for POS, <1s response for lab queue updates, 99.9% uptime target.
- **Supportability**: Integrated feedback widget, release notes surfaced in-app, contextual help.

## Opportunities & Solutions

- **Starter**: Single location, manual lab updates, foundational patient/order flows.
- **Standard**: Multi-location, automatic inventory transfers, shipping integrations, lab status automation.
- **Pro/Enterprise**: Advanced pricing, B2B accounts, analytics dashboards, lab hardware integration, ERP extensions.

Feature entitlements controlled per tenant to align with subscription tier.

## Migration Planning

1. **Discovery & Data Prep**: Export legacy patient/order data, cleanse duplicates.
2. **Pilot Store Launch**: Train staff, run dual systems for two weeks, validate reports.
3. **Regional Rollout**: Deploy in waves, provide hyper-care support, monitor KPIs.
4. **E-commerce Cutover**: Switch storefront APIs, run smoke tests, monitor conversion.
5. **Lab Automation Activation**: Enable automation features after staff certification.

## Implementation Governance

- Training curriculum per role with certification quizzes.
- Access provisioning via RBAC matrix tied to HR job codes.
- SOP library covering order adjustments, refunds, Rx corrections.
- Compliance reviews logging patient data access and retention policies.
- Release management: define go/no-go checklist, rollback scripts, sandbox validation.

## Architecture Change Management

- Quarterly roadmap review with executive steering committee.
- Continuous feedback captured via support tickets and in-app surveys.
- Change requests assessed for impact, prioritized, and tracked in architecture backlog.
- Versioned API contracts with deprecation policy and consumer notifications.

## User Journey Appendix

| Phase | Touchpoints | Success Indicators |
|-------|-------------|--------------------|
| Awareness & Training | Onboarding portal, instructor-led sessions | Staff readiness score ≥ 90% |
| Daily Operations | POS portal, lab dashboard, inventory view | Reduced checkout time, SLA compliance |
| Support & Improvement | In-app help, feedback widget | Resolution time < 4h, NPS ≥ 45 |

## References

- `docs/architecture/overview.md`
- `docs/architecture/modularity.md`
- `docs/architecture/orders_patient_data.md`
