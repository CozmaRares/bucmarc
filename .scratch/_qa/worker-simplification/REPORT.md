# QA Report: Background Worker Simplification

## What happened

The current background processing architecture uses a multi-worker pool that requires explicit dispatching from the Data Access Layer (DAL). This architecture is unnecessarily complex for the project's current needs and has introduced circular dependencies and initialization loops (where workers loading the DAL would unintentionally trigger more workers).

## What I expected

A simplified, timer-based background worker that is easier to reason about and maintain. Specifically:
1.  **Single Worker Thread**: Use only one persistent worker thread to avoid concurrency overhead and potential race conditions during regex matching.
2.  **Timer-Based Pull Model**: Instead of the DAL "pushing" jobs to the worker, the worker should "pull" pending jobs from the database on a fixed interval (e.g., every 30 seconds).
3.  **Batch Processing**: When the worker wakes up, it should process all `pending` jobs in the queue sequentially until the queue is empty.
4.  **Decoupled Architecture**: The DAL and API should only be responsible for creating job records in the database. They should have no knowledge of or dependency on the worker orchestration logic.

## Steps to reproduce

1.  Observe the current implementation in `src/lib/workerPool.ts` and `src/lib/worker.ts`.

## Implementation Plan

- [ ] Create a new timer-based orchestration in `src/lib/workerPool.ts` (or a new equivalent module).
- [ ] Update the worker script to handle batch processing of multiple jobs.
- [ ] Remove all worker-triggering code from the DAL (`src/db/dal/marks.ts`).
- [ ] Ensure the background timer starts on application boot.
- [ ] Remove the `isMainThread` workarounds once the circular dependency is broken at the import level.
