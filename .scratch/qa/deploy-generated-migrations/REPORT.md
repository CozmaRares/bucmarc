Status: ready-for-human

# Deploy With Generated Database Migrations

## Context

Bucmarc deployment currently relies on pushing the current Drizzle schema to the deployed VM database. That path requires manual intervention during deployment, which makes deploys harder to automate and easier to stall.

The intended deployment path is to generate Drizzle migrations on the development machine, ship those generated migrations with the app, and have the deployed VM apply any pending migrations automatically during deploy.

## What happened

The deployed VM cannot currently run the automatic migration path successfully. As a result, deploys still depend on `drizzle-kit push`, which can require manual confirmation on the deployed VM.

## What I expected

Deploying Bucmarc should apply database changes without interactive steps on the deployed VM. Generated Drizzle migrations should be created before deployment and applied automatically as part of the deploy process.

## Steps to observe

1. Make a schema change that requires a database migration.
2. Generate Drizzle migrations on the development machine.
3. Deploy Bucmarc to the VM.
4. Attempt to apply pending migrations on the deployed VM using the generated migration path.
5. Observe that the migration step does not currently complete successfully, leaving deploys dependent on the manual push path.

## Suggested scope

Treat this as deployment reliability work, not a change to Bucmarc's application logic.

1. Add package scripts for generating migrations locally and applying generated migrations in deployment.
2. Update the deployment process so the migration service applies generated migrations instead of pushing schema changes interactively.
3. Ensure generated migrations are included in the deployment artifact or mounted into the migration environment.
4. Investigate why the generated-migration command currently fails on the deployed VM and document or fix the root cause.
5. Keep database connection configuration explicit so the migration step targets the same Bucmarc database used by the running server.

## Acceptance criteria

- [ ] A developer can generate Drizzle migrations on a development machine before deployment.
- [ ] The deployed VM can apply pending generated migrations without interactive prompts.
- [ ] The deployment process no longer depends on `drizzle-kit push` for production database changes.
- [ ] The migration step runs before the Bucmarc server starts serving traffic.
- [ ] Generated migration files are available to the migration step in the deployed environment.

## Additional context

The current desired Drizzle flow is:

1. Run `drizzle-kit generate` on the development machine to create migration files.
2. Ship the generated migration files with the deploy.
3. Run `drizzle-kit migrate` on the deployed VM so pending migrations are applied automatically.

The current problem is specifically that the VM-side migration application does not work yet, so that failure needs to be investigated as part of this work rather than hidden behind a deploy-script change.

## Comments

### Triage - 2026-06-12

Ready for a human as deployment reliability work.

Current repo state already has `db:generate` and `db:migrate` scripts plus a `migrate` service in `compose.yaml`, but there are no generated migration files in `drizzle/`. The pickup should verify the generated-migration path end to end, ensure migrations are shipped to and mounted in the deployment environment, and confirm the compose migration command uses the intended environment variable.
