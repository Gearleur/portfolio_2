# White gallery — first composition

Working branch: `feat/retro-glass-desktop`, based on `feat/sortie-ecran-cinematique`.
The desktop redesign and the gallery are not merged into main.

## History reviewed

- `135ddb8`: resets CSS3D inline styles on desktop return, hides inactive cinematic
  controls, separates the portal from the mode toggle and confines desktop focus.
- `9d7a624`: synchronizes scroll and camera on reentry and connects authored camera depths.
- `b791b81`, `86855f7`, `5fd4b13`: stop the hidden renderer and release it after its grace period.
- `971e5ae`, `356836f`, `14d8455`: initial camera/DOM projection, screen glow and dark room.

## Changes

The small CRT is replaced by a larger, recessed architectural screen. The live
DOM remains attached while legible; a texture of the existing Windows wallpaper
replaces it at distance. This is not a snapshot of the currently opened windows.
A white floor, fine joints, wall, repeated structural bays and simple desktop
accessories provide scale and visible parallax. Shadows are rendered with one
1024px directional shadow map. A local blue point light illuminates the screen base.
The old mirrored duplicate scene under a transparent floor is removed.

The camera keeps looking back into the gallery instead of rotating away into
empty space. Return travel starts at the actual current camera pose, including
scroll depth. Desktop styles are cleared before paint; queued desktop frames
cannot write CSS3D transforms back after cleanup.

Texture loading does not suspend the canvas. The first loading attempt with a
suspending loader froze the transition in a browser capture despite the outer
state reaching `room`. The asynchronous texture is disposed on unmount and its
material is rebuilt when the texture becomes available.

## Verification scope

Unit tests preserve initial projection, monotonic retreat and the readability
threshold. The two timing assertions for the previous tiny CRT are replaced:
the larger portal intentionally stays readable at the end of the reveal.
A browser regression verifies that real camera frames continue after entry,
then scrolls to the end, returns and checks desktop geometry and interaction.
Existing projection, idle-renderer, focus, repeat-visit and mobile tests remain.

## Art direction still to develop

This is a browser-rendered composition prototype, not a photorealistic recreation
of the reference. It keeps a landscape portal to match the real desktop.
There is no grass, organic scenery, baked indirect lighting or detailed CRT model.
Blender can supply optimized GLB props, beveled monitor housings and baked contact
lighting once the composition is accepted. Camera motion and the interactive
DOM screen should stay in the browser. Next visual refinements are softer contact
shadows, a richer screen light spill and authored props rather than adding more
camera choreography before the scene is settled.
