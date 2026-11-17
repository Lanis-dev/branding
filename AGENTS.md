# Branding library

This is a manually maintained collection of existing LANIS branding. Do not invent assets or copy, create campaign layouts or translations, or add brand rules. Organise by content and use, not by source repository or application. Keep one canonical copy of each asset. Do not add upstream snapshots, provenance links to every item, copying/sync pipelines, redundant archives or unrelated GitHub Actions workflows. The owner explicitly requested a Cloudflare Workers deployment workflow for the catalog.

Copy existing material into the appropriate folder and update catalog/assets.js, copy/marketing.js or brand/colours.js by hand. Existing project asset scripts may be used when requested to export sizes or variants of the existing artwork. Do not change its geometry, palettes or typography to create a new identity.

Image generation is prohibited for every agent on this machine. Never call image-generation tools, models, APIs, services, CLIs or scripts, or delegate image generation. Use existing assets and actual HTML/CSS for catalog work.

Fetch origin before new work and use a separate task worktree. Do not modify other checkouts or production. No build is required. Check catalog changes at desktop and mobile widths and verify local download paths. Refer to the backend as lanis_api.
