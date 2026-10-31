---
name: stitch
description: >-
  Interact with Google Stitch design projects via MCP. Retrieve design screens,
  extract layout definitions, convert Stitch UI frames to React/Tailwind components,
  and sync design tokens directly into code.
---

# Google Stitch MCP Skill

This skill guides querying and transforming Google Stitch designs into production code.

## Available Capabilities via Stitch MCP

1. **List & Discover Projects**:
   - Query available Stitch design workspaces and project IDs.
   - Inspect screen names, device viewports, and revision states.

2. **Retrieve Screen Definitions**:
   - Fetch the raw layout structure, component boundaries, and styling metadata for specific screens.
   - Inspect text layers, typography specs, colors, and layout flexboxes.

3. **Design-to-Code Conversion**:
   - Map Stitch color tokens to the project's Tailwind configuration (`tailwind.config.js`).
   - Translate layout hierarchies into idiomatic React / Next.js JSX with Tailwind utility classes.
   - Preserve responsive constraints (desktop, tablet, mobile viewports).

4. **Generating Design Variations**:
   - Suggest and generate design edits back to the Stitch canvas using natural language prompts.
