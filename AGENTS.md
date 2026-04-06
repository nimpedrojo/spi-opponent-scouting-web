# AGENTS.md

## Project
SPI Opponent Scouting

## Purpose
This repository belongs to the ProcessIQ Sports suite and represents a dedicated application for opponent scouting.

Its purpose is to centralize qualitative and structured analysis of rival teams, replacing spreadsheet-based workflows with a maintainable product that can evolve into an integrated intelligence module within the wider ProcessIQ ecosystem.

This project must not be treated as a simple form builder or a spreadsheet clone. It is a domain product for:
- opponent scouting
- tactical analysis
- match preparation
- structured decision support

## Product Context
ProcessIQ Sports aims to centralize sports data sources, automate analysis, improve player and team follow-up, and reduce dependency on isolated tools. Existing products already cover match event capture, reporting, and integrations. This repository covers the opponent analysis domain.

This project should be designed so it can integrate progressively with:
- spi-core-api
- spi-scouting-web
- spi-tagging-api
- spi-integrations-gesdep-api

The application should be usable on its own, but architected for future integration with the suite.

## Core Principles
When working on this repository, always follow these principles:

1. Model the domain, not the spreadsheet
Do not translate Excel sheets or tabs directly into code, database tables, or UI screens.
The spreadsheet is a source of business knowledge, not the target architecture.

2. Prefer structured data over free text
Free text is allowed where tactical nuance is necessary, but always prefer structured fields when the information may later be filtered, compared, aggregated, or reused.

3. Build for progressive integration
Assume some data may initially live inside this product, but design code so shared entities can later be sourced from core services.

4. Keep the product coach-friendly
The interface and workflows must support analysts and coaching staff. Technical implementation must not leak unnecessary complexity into the user experience.

5. Versioning is mandatory
Scouting reports are time-sensitive. Support draft, publish, duplicate, and historical traceability from the start or with minimal extension cost.

6. Avoid overengineering the MVP
The first iterations should prioritize usable workflows for real staff over abstract generalization. However, shortcuts that block future integration are not acceptable.

7. Explicitness over magic
Avoid hidden conventions, dynamic schemas with unclear behavior, and generic builders that make the domain harder to understand.

## Expected Functional Scope
The product is expected to support, progressively:
- opponent directory
- scouting reports
- tactical systems
- tactical analysis by phase
- strategy recommendations
- SWOT / DAFO analysis
- squad and staff notes
- form / dynamics
- report preview
- report publication
- exportable output
- future linkage with matches, teams, and core analytics

## Domain Language
Use clear and consistent domain terminology across code, database, API, and UI.

Preferred terms:
- Opponent
- Scouting Report
- Tactical Analysis
- Strategy Recommendation
- SWOT Item
- System Usage
- Report Section
- Draft
- Published
- Archived

Avoid vague names such as:
- data1
- block
- itemGeneric
- contentSection
- tabData
- miscInfo

Name things according to the business meaning.

## Architectural Guidelines

### General
- Use a modular architecture organized by business capability.
- Keep business logic out of controllers and UI components.
- Separate transport models from domain models.
- Avoid coupling persistence shape directly to frontend rendering needs.
- Favor explicit services and repositories over large utility files.

### Backend
If working in the backend:
- organize code by module
- each module should contain routes, controller, service, repository, schemas, and types if needed
- validate all input at the boundary
- keep controllers thin
- keep services focused on business behavior
- keep repositories focused on persistence
- use DTOs explicitly
- make publish and duplicate flows first-class operations, not side effects

Suggested module boundaries:
- opponents
- scouting-reports
- report-sections
- tactical-analysis
- systems
- strategy
- swot
- catalogs
- auth
- exports

### Frontend
If working in the frontend:
- organize code by feature, not by file type alone
- avoid massive pages with embedded business logic
- use reusable form components only when they reduce duplication without hiding domain intent
- prefer small, predictable state units
- distinguish clearly between edit mode, preview mode, and published mode
- treat the report editor as a workflow, not a spreadsheet grid

Suggested feature boundaries:
- opponent-directory
- report-editor
- report-preview
- systems-editor
- tactical-analysis-editor
- strategy-editor
- swot-editor
- squad-editor
- form-editor

## Data Modeling Rules
- Each report belongs to an opponent.
- A report may optionally be associated with a match.
- Reports must support status transitions such as draft and published.
- Reports must support versioning or duplication.
- Sections should be modeled by meaning, not just by display order.
- Use catalogs for repeated tactical concepts where appropriate.
- Use snapshots when the report must preserve a point-in-time view of mutable data.

Do not:
- store everything as one JSON blob unless there is a very strong reason
- design the model around UI tabs
- merge unrelated concepts into one table just to reduce table count
- over-normalize narrative content that is better kept readable

## API Design Rules
- Use clear resource-oriented endpoints
- Keep payloads explicit and predictable
- Do not expose internal persistence quirks through the API
- Use dedicated actions for domain behaviors such as publish and duplicate
- Return stable response shapes
- Version API behavior carefully if breaking changes appear

Preferred patterns:
- `GET /opponents`
- `POST /opponents`
- `GET /scouting-reports/:id`
- `PUT /scouting-reports/:id/systems`
- `PUT /scouting-reports/:id/tactical-analysis`
- `POST /scouting-reports/:id/publish`
- `POST /scouting-reports/:id/duplicate`

## UX Rules
- Do not recreate the original spreadsheet UI.
- The main editing experience should be section-based.
- Users should always know:
  - what report they are editing
  - what opponent it belongs to
  - whether it is draft or published
  - which sections are complete or incomplete
- Use progressive disclosure where possible.
- Optimize for analyst workflow and review by coaches.

## Quality Standards
All generated code should aim for:
- readability
- explicit naming
- predictable control flow
- testability
- low accidental complexity

Before implementing, prefer asking:
- is this aligned with the domain?
- will this be understandable in six months?
- does this help integration later?
- is this adding flexibility the product actually needs?

## Testing Expectations
At minimum:
- test core business flows
- test validation rules
- test publish workflow
- test duplicate/version workflow
- test permission-sensitive operations if auth exists
- test critical data transformation logic

Frontend changes should include tests for:
- key workflows
- section save behavior
- state transitions
- published vs draft rendering when relevant

## Refactoring Guidance
Refactor when:
- a module hides multiple business concepts
- repeated patterns are causing inconsistencies
- free-text structures should become explicit models
- shared tactical concepts appear in several places

Do not refactor just for abstraction aesthetics.
Refactor to improve domain clarity, consistency, or maintainability.

## Performance Guidance
This product is not a high-frequency real-time system.
Optimize first for:
- correctness
- clarity
- maintainability

Then optimize:
- list loading
- preview generation
- report retrieval
- export generation

Avoid premature optimization.

## Security and Permissions
Assume the product will eventually support roles such as:
- admin
- analyst
- coach
- viewer

Code should be written so permission checks can be added or extended without rewriting business logic.

Never assume all authenticated users can edit everything.

## Integration Guidance
This repository is part of a suite. Do not hardcode assumptions that isolate it forever.

Design integration points for:
- seasons
- categories
- teams
- matches
- user identity
- future analytics enrichment

When a shared source does not yet exist, isolate the temporary implementation behind clear boundaries so it can be replaced later.

## Documentation Rules
When adding new modules or features:
- document the purpose of the module
- document important business rules
- document non-obvious status transitions
- document integration assumptions
- update examples when payloads change

## Decision Rules for Codex
When multiple implementation options are possible, prefer this order:

1. the option that preserves domain clarity
2. the option that keeps the MVP usable
3. the option that supports future integration
4. the option that minimizes accidental complexity
5. the option that is easiest to test

If a trade-off is unclear, do not invent product behavior silently.
Leave a clear note in code or PR output stating:
- what assumption was made
- why it was made
- what should be confirmed later

## What Codex Must Avoid
Do not:
- clone spreadsheet behavior literally
- introduce generic schema builders for everything
- hide business logic inside UI components
- put all report content in a single untyped field
- create ambiguous names
- mix domain logic with formatting logic
- couple frontend forms directly to database entities
- implement silent status transitions
- invent tactical categories without making them explicit

## Good Output Style
When generating code, plans, or refactors:
- be explicit
- keep business naming intact
- add comments only where they provide real value
- prefer small cohesive units
- surface assumptions clearly

## Initial Priority Focus
If the repository is in early stage, prioritize:
1. project setup
2. core domain entities
3. opponent CRUD
4. scouting report lifecycle
5. systems section
6. tactical analysis section
7. strategy section
8. SWOT section
9. preview and publish flow
10. integration hooks

## Final Instruction
This repository should evolve as a reliable scouting product inside ProcessIQ Sports.

Every implementation decision must support this direction:
structured opponent intelligence, usable by staff today, integrable with the suite tomorrow.