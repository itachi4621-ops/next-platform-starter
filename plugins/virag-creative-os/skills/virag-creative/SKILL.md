---
name: virag-creative
description: Execute Virag Creative OS workflows for current-brief-only design, source fidelity, 3D Studio, Movie Lab, packaging, flyers, identity preservation, AI modes, and sequential standalone outputs.
---

# Virag Creative OS

Use this skill whenever the user asks for a Virag creative workflow, refers to a Virag command, or requests premium creative direction that matches the system below.

## Highest-priority run lock

Determine the subject, topic, campaign, occasion, offer, copy, and visual brief for the current run only from the current user message and current uploads. Never pull an older campaign, festival, headline, CTA, product story, or concept into a new run unless the user explicitly says previous, above, same as before, continue, reuse, or otherwise clearly references it.

## Source fidelity

Detect the primary asset type before designing: product/package, food/beverage, person/character, vehicle/object, logo/brand asset, existing post/design, place/interior, or mixed reference set.

Preserve visible source-defining facts. For products, preserve silhouette, package geometry, proportions, label placement, logo/artwork, colors, materials, and supplied factual copy. For people, preserve recognizable identity, facial/body proportions, hair, and distinguishing features. For existing designs, preserve important content not explicitly requested to change. Do not import unrelated brands or unsupported details.

Never invent prices, offers, ingredients, nutrition, certifications, medical/performance claims, technical specs, awards, testimonials, hidden internals, or other factual claims not present in the current source.

## Output rule

One concept equals one standalone final image. Never combine requested creatives into a collage, grid, contact sheet, storyboard board, split-screen, or multi-panel canvas unless the user explicitly asks for a collage or grid.

If the user requests N images, return N separate image outputs in order. If there are multiple distinct products/subjects, handle them independently unless the user explicitly asks to combine them.

## Core aliases

Interpret these Virag aliases as workflow selectors:

- `/master` — analyze the current brief and execute the strongest best-fit creative direction.
- `/creative` — fresh agency-level social creative.
- `/productad` — premium product advertising with the supplied product as the hero.
- `/flyer` — campaign-led flyer with one dominant hook and a CTA only when supported.
- `/packaging` — design the packaging/label/form factor itself; preserve factual/legal content supplied by the user.
- `/facelock` — strict identity preservation.

## 3D Studio v2

For all 3D Studio presets, generate the final still-image result rather than returning only a prompt or plan. Use physically coherent camera perspective, scale, gravity, contact, shadows, reflections, material roughness/thickness, depth, and motivated lighting. Avoid melted geometry, warped labels, floating contact errors, fake reflections, random smoke, meaningless particles, repetitive cylinders, and generic podium templates.

Presets:

- `/3dhero` — cinematic 3D hero with strong scale, premium materials, and motivated key/fill/rim lighting.
- `/3dworld` — immersive custom world derived only from current brand/category cues with foreground, midground, and background depth.
- `/3danamorphic` — single-view forced-perspective display illusion with clear screen boundary, occlusion, and cast/contact shadows.
- `/3dchrome` — refined chrome sculptural environment; do not chrome-coat the locked subject unless asked.
- `/3dglass` — transparent/refractive environment with thickness, refraction, edge highlights, and optical depth; keep labels/faces undistorted.
- `/3dliquid` — one controlled fluid-sculpture gesture with believable viscosity, surface tension, droplets, gravity, and contact.
- `/3dexploded` — exploded view using only visible or explicitly supplied components; never fabricate hidden parts.
- `/3dxray` — translucent structural visualization using only visible or explicitly supplied structure; never invent internals.
- `/3dmacro` — extreme close-up of one real visible detail with believable micro-surface response and depth of field.
- `/3dfloating` — zero-gravity composition with believable orientation, spacing, perspective, and no deformation/collisions.
- `/3dsurreal` — one clear reality-bending rule: scale, gravity, architecture, environment, or material behavior.
- `/3darchitecture` — monumental architecture framing/staging the subject with believable scale references and structural logic.
- `/3dtype` — readable physical 3D typography using supplied copy or a safe non-factual hook; never cover critical subject details.
- `/3dmechanical` — engineered environmental machinery as campaign language, not claimed real product internals unless supplied.
- `/3denergy` — controlled volumetric energy/light flow used only as visual metaphor, never unsupported scientific proof.
- `/3dpedestal` — custom category-specific sculptural display; avoid generic cylinder/plinth templates.
- `/3dportal` — dimensional opening/reveal with thickness, coherent perspective, occlusion, contact, light spill, and atmosphere.
- `/3dinflatable` — soft pressure-driven environmental forms; keep rigid products rigid.
- `/3dterrain` — cinematic terrain from one visible supported material/category cue; do not infer unsupported substances.
- `/3dminimal` — exact subject plus one sculptural idea, restrained materials, precise lighting, and strong negative space.

Every 3D preset must be visually distinct in spatial mechanism, camera logic, material system, and composition. Do not reduce variation to recolors or podium swaps.

## Movie Lab

Create original cinematic marketing art from the current brief. Preserve source truth and never reproduce a specific official poster/key-art composition. High-level genre language, lighting, typography energy, framing, and marketing conventions are allowed.

Common aliases include `/movieposter`, `/teaserposter`, `/characterposter`, `/ottposter`, `/productmovie`, and `/cine-action`.

## AI command-token mode

When the user invokes an AI mode alias such as `/human`, `/expert`, `/ceo`, `/viral`, `/seo`, `/critic`, `/teacher`, `/eli5`, `/brief`, `/strategy`, `/copywriter`, `/research`, `/brainstorm`, `/promptengineer`, `/summarize`, `/translate`, `/improve`, `/simplify`, `/expand`, `/compare`, `/list`, `/table`, `/outline`, `/code`, `/debug`, `/explaincode`, `/email`, `/coverletter`, `/interview`, or `/motivate`, apply that mode to the current task without importing unrelated project context.

## Decision quality

Make strong art-direction choices instead of returning vague option lists. Prioritize hierarchy, focal idea, deliberate composition, category-fit visual language, realistic materials/lighting when relevant, and finished publish-ready quality.

Ask a question only when a genuinely required fact cannot be inferred from the current brief or uploads. Do not ask for confirmation for routine creative execution.
