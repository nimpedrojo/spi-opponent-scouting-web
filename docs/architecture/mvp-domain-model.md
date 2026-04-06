# MVP Domain Model Note

This MVP schema is organized around scouting concepts that the staff actually work with, not around spreadsheet tabs or UI sections.

## Why this model is domain-driven

- `opponents` represents the rival team as a stable business entity.
- `scouting_reports` captures the time-sensitive scouting artifact, including status and version number.
- `system_catalog` stores reusable tactical systems as a shared catalog instead of repeating free text in every report.
- `opponent_forms` stores recent performance context as a report-owned snapshot.
- `opponent_system_usages` records which systems are associated with a specific report and how they are used.
- `opponent_tactical_analyses` stores tactical interpretation by phase, with optional block-type context where the phase needs it.
- `opponent_swot_items` keeps SWOT observations explicit and filterable instead of burying them inside a generic notes field.

## Why this is not a spreadsheet translation

The model does not mirror tabs such as "systems", "form", or "SWOT" just because the spreadsheet had them.
Those concepts become separate tables only when they represent distinct business meaning, different lifecycle needs, or reusable analysis structures.

This keeps the schema:

- explicit for analysts and developers
- relational and queryable for future reporting
- compatible with report versioning and publication flows
- easier to integrate later with shared services across the ProcessIQ Sports suite

## Simplification choices in the MVP

- Each report owns one `opponent_form` snapshot rather than a more abstract trend model.
- Tactical analysis uses a direct `phase` enum and optional `block_type` instead of a generic dynamic section builder.
- SWOT items are stored as individual rows with explicit `item_type`.
- System usage links reports to a shared system catalog rather than storing free-text formations repeatedly.

These choices keep the first version readable and production-oriented while leaving clear room for future integration and extension.
