# TL Mabuhay 3D Decal Pack

Transparent, projection-ready vehicle decals matching the navy, gold, red, and white TL Mabuhay fleet treatment.

## Included artwork

- `tl-mabuhay-side-livery-right-4k.png` — passenger/right-side fleet livery
- `tl-mabuhay-side-livery-left-4k.png` — driver/left-side fleet livery; text remains readable
- `tl-mabuhay-rear-warning-only-4k.png` — rear `CAUTION / STUDENT DRIVER` marking
- `tl-mabuhay-rear-full-4k.png` — high-resolution Hiace-style complete rear branding
- `tl-mabuhay-rear-full-original.png` — original Hiace-style full rear artwork
- Matching SVG source files for resizing and editing
- `tl-mabuhay-round-logo.png` — separate transparent round emblem

All PNG files use real RGBA transparency; no white or checkerboard background is baked into the artwork.

## Blender setup

1. Add a thin plane or use a decal/shrinkwrap workflow over the vehicle panel.
2. Connect the PNG `Color` output to Principled BSDF `Base Color` and `Alpha` to `Alpha`.
3. Set the material blend mode to `Alpha Blend`, `Alpha Hashed`, or `Alpha Clip` depending on your render engine.
4. Offset the decal approximately `0.001–0.003 m` from the body to prevent z-fighting.
5. Conform or shrinkwrap the decal to the door/trunk curvature instead of leaving it as a floating flat card.

## Three.js setup

Use the PNG as the decal material map with `transparent: true`. For a projected decal mesh, enable polygon offset or keep the decal slightly above the paint surface to prevent flicker. Do not mirror the right-side texture for the left side; use the supplied left-side version so the words do not become reversed.

## Placement notes

- Keep the livery inside painted body panels.
- Avoid covering door handles, lamps, wheel arches, windows, and panel gaps.
- Rotate and scale the decal mesh to follow the vehicle surface.
- Use the warning-only texture on sedan trunks; use the full original rear artwork on larger Hiace/van doors.
