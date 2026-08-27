# Virag Creative OS Plugin

Virag Creative OS is packaged as a skill-only ChatGPT/Codex plugin. It includes current-brief locking, strict source fidelity, standalone-output rules, core creative workflows, 3D Studio v2 presets, Movie Lab behavior, packaging/flyer/identity workflows, and AI command modes.

## Structure

- `.codex-plugin/plugin.json` — required plugin manifest
- `skills/virag-creative/SKILL.md` — Virag workflow skill

No MCP server is required for this first package because the plugin is workflow/instruction based.

## Local repo marketplace

The repository includes `.agents/plugins/marketplace.json` with a local entry pointing at `./plugins/virag-creative-os`.

Restart the ChatGPT desktop app after pulling the latest repository changes, then open the Plugins Directory and select the `Virag Local Plugins` marketplace source.

## Important UI note

The existing Virag browser userscript and its neon-glass injected UI are separate from this plugin package. ChatGPT/Codex plugin packaging can bundle skills, MCP connections/servers, hooks, and plugin assets, but it does not directly install a browser userscript into the ChatGPT web page. The userscript can continue to be used independently alongside this plugin.
