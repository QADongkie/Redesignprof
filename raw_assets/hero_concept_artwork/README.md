# TL Mabuhay Animated Hero — Layered 2.5D Package

This is the animation-ready recreation of the supplied cinematic road artwork.
It uses a lightweight **layered 2.5D approach** instead of a heavy 3D scene, so
it keeps the premium advertising look while loading and animating smoothly on a
business website.

## Final displayed copy

**TL MABUHAY**  
**DRIVING LESSON ACADEMY, INC.**

The former “Road to Ready” wording has been removed completely. The brand name
inside the SVG links to https://tlmabuhay.com/.

## Files

- `index.html` — complete Anime.js animation demonstration.
- `tl-mabuhay-layered-hero.svg` — editable layered SVG composition.
- `tl-mabuhay-layered-hero-preview.png` — 1600 × 900 static fallback/poster.
- `tl-mabuhay-background.png` — clean road, mountains and sunset plate.
- `tl-mabuhay-car.png` — transparent rear three-quarter car layer.
- `tl-mabuhay-emblem.png` — emblem used by the intro transition.

## Included animation

- FIFA-style TL Mabuhay emblem intro and road-stripe wipe.
- Staggered brand-copy reveal.
- Car entrance from the foreground.
- Subtle body suspension and tail-light pulse.
- Animated road-speed lines.
- Mouse parallax between background, sun and vehicle.
- Scroll transition that drives the car forward toward the road and horizon.
- `prefers-reduced-motion` support.

## SVG layer IDs

- `#background-parallax`
- `#sun-halo-layer`
- `#sun-ring`
- `#atmosphere-layer`
- `#copy-layer`
- `#copy-eyebrow`
- `#copy-title`
- `#copy-subtitle`
- `#car-scroll-layer`
- `#car-parallax-layer`
- `#car-arrival-layer`
- `#tail-light-glow`

The nested car groups deliberately separate entrance motion, mouse parallax and
scroll motion so the transforms do not overwrite each other.

## Run locally

Serve the folder from a local web server so the SVG and image layers are loaded
with the same origin:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080/tl-mabuhay-animated-hero/
```

## Vite integration

Copy the entire folder into `public/tl-mabuhay-animated-hero/`. You can first
test the complete experience through an iframe:

```html
<iframe
  src="/tl-mabuhay-animated-hero/index.html"
  title="TL Mabuhay Driving Lesson Academy"
  style="width:100%;height:100vh;border:0">
</iframe>
```

For final production integration, move the styles and animation script from
`index.html` into the existing hero component while keeping the SVG layer IDs.

## Performance recommendation

Use `tl-mabuhay-layered-hero-preview.png` as the poster/fallback while the
background and transparent car image decode. The layered version is much
lighter to operate than a realtime Three.js landscape and avoids making the
academy website feel like a driving game.

The supplied TL Mabuhay emblem remains subject to the brand owner's rights.
