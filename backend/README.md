# Optical ERP Backend (Draft)

This directory contains the initial skeleton for the modular monolith backend, starting with the Orders module focused on capturing patient data snapshots during order creation.

## Structure

- `src/modules/orders/domain` – Domain models for orders, patient snapshots, and prescriptions.
- `src/modules/orders/application` – Application services and commands for order workflows.
- `src/modules/orders/interfaces/http` – HTTP-facing controller stubs illustrating REST contracts.
- `src/modules/orders/infrastructure` – Ports and in-memory adapters for persistence and external data access.
- `docs/architecture/orders_patient_data.md` – Detailed design notes for patient data handling within orders.

## Next Steps

1. Replace in-memory adapters with real persistence (PostgreSQL) and Customers module integrations.
2. Wire the `OrderService` into a NestJS module with DTO validation and RBAC guards.
3. Implement pricing calculations and inventory reservations prior to finalizing order totals.
