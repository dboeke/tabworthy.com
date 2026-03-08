// Base queries barrel export
// Each module imports db from '../index' and schema from '../schema' directly.
// This file re-exports all query functions from sub-modules.

// Plan 02: taxonomy browsing queries
export * from './taxonomy'

// Plan 03: channel profile queries
export * from './channels'

// Phase 02 Plan 02: admin channel CRUD queries
export * from './admin'

// Phase 02 Plan 04: search, autocomplete, and feeds
export * from './search'
