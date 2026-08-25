# TL Mabuhay FAQ — Option 1 (Section Only)

This package contains only the PeachWeb-inspired FAQ-to-contact journey. It does not contain or replace the rest of the TL Mabuhay website.

## Included files

- `components/sections/faq-section.tsx` — the FAQ React component and Anime.js behavior.
- `styles/faq-option-1.css` — only the styles required by this FAQ section.

## Safe integration

1. Back up your current FAQ component.
2. Replace only `components/sections/faq-section.tsx` with the supplied component.
3. Open `styles/faq-option-1.css` and append its contents to the end of your existing `app/globals.css`.
4. Do not replace your complete `app/globals.css` file.
5. Keep your current `data/faqs.ts`. The component reads your existing FAQ questions and answers from that file.
6. Confirm that your project already contains:
   - `animejs`
   - `@/components/common/icons` with `ArrowIcon`
   - `@/data/faqs` exporting `faqs`
7. Run your normal production build.

## What this section adds

- A pinned, full-screen desktop FAQ journey.
- Four scroll-led questions using the existing FAQ data.
- Anime.js text transitions.
- A gold SVG road-progress animation.
- A final “Talk to TL Mabuhay” contact takeover.
- A touch-friendly mobile accordion.
- Keyboard navigation, ARIA states, and reduced-motion support.

## Files this package does not change

- Hero section
- Courses and course planner
- Campaign or sun animation
- Timeline
- Branch locator and Philippines map
- Final 3D arrival scene
- Vehicle models or decals
- Header, footer, metadata, configuration, or deployment files

No image, video, SVG asset, GLB model, or additional Three.js scene is required by this FAQ section.
