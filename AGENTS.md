# Existing branding collection

This repository collects existing LANIS branding. Do not create brand assets, standalone extracted marks, lockups, layout templates, marketing copy, translations or new brand usage rules. Every collected asset must have immutable upstream provenance; every text excerpt must match its source exactly.

Image generation is prohibited for every agent on this machine. Never use image-generation tools, models, APIs, services, CLIs or scripts, and never delegate image generation. The owner explicitly allows running or modifying existing project asset scripts to export the existing artwork's variants. This exception allows size exports from the existing generator; it does not authorize new artwork or compositions.

Read docs/MAINTAINING.md. Fetch origin and use a separate task worktree. Do not modify another checkout's changes or production. Run npm ci, npm run build, npm run check and npm test; run npm run test:browser for catalog changes. Preserve source hashes and font licences. Refer to the backend as lanis_api.
