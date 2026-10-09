# Changelog

This document records all formal version iterations and major changes of SWBIM Scope since project initiation.

> **Versioning Convention**:  
> - Major version is fixed at `v1` (displayed as `v1` in everyday usage);  
> - Full sub-version follows `v1.<YYMMDDHHMM>`, where the 10-digit timestamp represents Year, Month, Day, Hour, Minute.

---

## Development Time Metrics

> ⏱️ **Total Active Development Time**: **41 Hours 21 Minutes (41.36 Hours)**  
> 📅 **Total Calendar Span**: **10 Days 2 Hours 22 Minutes** (2026-09-29 22:17 to 2026-10-10 00:40)  
> 🔢 **Total Engineering Steps**: **18,646 Steps** (across 21 active development sprints)  
> 🔄 **Update Policy**: Recalculated automatically from active development telemetry logs upon every distribution build.

### Daily Breakdown
| Date | Active Sprints | Active Hours | Milestones |
| :--- | :--- | :---: | :--- |
| **2026-09-29** | 22:17~00:53 | 2h 36m (2.60h) | Project scaffold & Three.js engine setup |
| **2026-09-30** | 23:51~01:56 | 2h 05m (2.08h) | 3D compass, elevation readouts, pin labels & demo model |
| **2026-10-01** | 23:28~01:06 | 1h 38m (1.64h) | Section gizmo controls, shader & material styling |
| **2026-10-02** | 22:04~01:38 | 3h 34m (3.57h) | FBX format integration, streaming IFC parsing |
| **2026-10-03** | 09:55~10:39, 23:11~03:24 (6 sessions) | 9h 07m (9.13h) | Wall CSG void cutouts, railing fixes, inspector accordions & tree refactor |
| **2026-10-04** | 10:02~10:34, 19:23~22:34 (3 sessions) | 9h 31m (9.52h) | Ortho/Persp toggle, NSEW views, 50-step view history, context menu fix, 10% hover |
| **2026-10-05** | 19:04~00:27 | 5h 23m (5.38h) | Stationary panels, pure highlight, CAD box selection, pivot orbit, bottom shadow |
| **2026-10-06** | 20:29~21:12 | 0h 43m (0.72h) | Multi-format subtitle & metadata sync, FBX robust loader, bilingual toggle sync |
| **2026-10-07** | 18:43~22:04, 23:03~23:05 | 3h 23m (3.39h) | Feature development |
| **2026-10-08** | 13:25~13:42, 21:37~21:46 (3 sessions) | 0h 46m (0.77h) | Feature development |
| **2026-10-09** | 22:06~00:40 | 2h 33m (2.56h) | Feature development |

---

## [v1.2610072000] - 2026-10-07 20:00

### Multi-Version Model Comparison Mode Engine (IFC Launch)
- **Compare Mode Top Entry & Dual-Zone Setup Modal**
  1. **Top Navbar Layout Reorganization & Twin Tab-Matched Rounded Buttons**: Relocated the [Compare] button immediately to the left of the [Open Model] button, adopting identical primary CTA styling (vibrant blue fill #0284c7 with accent glowing border #38bdf8), crafting both buttons with a disciplined 6px corner radius matching tab headers (Tab-matched 6px rounded geometry), eliminating excessive pill roundness, featuring responsive bilingual typography for an aesthetically cohesive, professional engineering UI.
  2. **Light Green/Red Dual Zones & One-Click Swap**: Left zone designated for "New Revision" with subtle green tint (`#f0fdf4`), pre-populating currently active model; right zone for "Old Baseline" with subtle red tint (`#fef2f2`); center `⇄` swap button instantly switches files and roles; supports drag-and-drop or file pickers.
  3. **Full-Screen Modal Masking & Drag Conflict Elimination**: Comparing modal employs a full-screen frosted glass backdrop covering top navbar, sidebars, and viewport, intercepting background clicks, wheel zoom, and hotkeys; completely eliminates the bug where dragging files across the 3D viewport falsely triggered and stuck the viewport's drop prompt overlay; supports dismiss via backdrop click or Escape key while retaining chosen file slots upon reopening.
  4. **Zero-Similarity Exception Interception & Mis-Selection Guard**: When two selected models share zero matching or related components (0% match, all elements classified as wholly added or deleted, indicating an accidental file mis-selection or unrelated projects), automatically halts entry into 3D comparison mode, displays a high-priority warning toast, and non-destructively restores the comparison setup modal while preserving chosen file slots for swift review and re-selection.

- **IFC GlobalId Alignment & Deep Topology Diff Engine**
  1. **GlobalId Alignment & Lifecycle Classification**: Aligns entities via IFC standard `GlobalId`; elements exclusive to new model are classified as Added (Green); elements exclusive to old baseline are classified as Deleted (Red, cloned and injected as translucent red meshes into `CompareDeletedGroup`); matched elements undergo deep difference inspection.
  2. **Geometric & Spatial Drift Detection**: Computes world bounding box center and extent deviations against a 2mm threshold; if exceeded, classified as "Geometric Shift"; if unchanged geometrically but Pset properties differ, classified as "Metadata Only".

- **4-Color Semantic Rendering & Unchanged Opacity Control**
  1. **Texture Stripping & 4-Color Semantic Material Override**: Original materials and textures are stripped in favor of high-contrast engineering colors: Unchanged in matte gray-white (`#d8dce2`), Added in vivid green (`#22c55e`), Deleted in translucent red (`#ef4444`, opacity 0.45), Modified in warning orange-yellow (`#f59e0b`).
  2. **Continuous 0%-100% Unchanged Opacity Slider**: Top of left comparison panel provides an "Unchanged Opacity" slider defaulting to 30% translucent; users can slide down to 0% to completely hide unchanged elements, or up to 100% for full solid rendering.

- **Interactive Pre-Revision Ghost Geometry Overlay**
  1. **Pre-Revision Ghost Mesh Reconstruction**: Selecting a modified element with geometric/spatial shifts renders a yellow translucent ghost overlay (`#fbbf24`, opacity 0.48) depicting its pre-revision shape and position; elements with metadata-only changes omit the ghost mesh.
  2. **Raycast Pass-Through & Memory Disposal**: Ghost mesh is protected from raycast picking to preserve normal selection; smooth geometry and material disposal upon deselection or element switching.

- **Left Sidebar HUD Pills & Dual-Mode Difference Tree**
  1. **Tri-Color Metrics HUD & Filter Chips**: Left sidebar switches to dedicated comparison view featuring Green (+Added), Red (-Deleted), and Orange (~Modified) pills; clicking any pill acts as a filter chip isolating matching elements.
  2. **Dual-Mode Difference Tree**: Difference tree filters out unchanged components and provides two toggleable views: ① "Hierarchy Mode" preserving original IFC spatial hierarchy with colored status dots and Ghost badges; ② "Status Group Mode" grouping elements under Added, Deleted, and Modified cards while preserving internal nesting.

- **Inspector Diff Table & Sticky Banner Clean Exit**
  1. **Inspector Property Diff Table**: Selecting modified elements renders a top Diff card highlighting altered properties with old and new values (`Old Value ➔ New Value`), along with a toggle for full property sets.
  2. **Sticky Status Banner & Clean Exit**: Viewport features a floating status banner with green pulse dot indicating active comparison; clicking "Exit" seamlessly restores original textures/materials, removes injected deleted meshes and ghost overlays, and resets the sidebar with zero memory leaks.

- **Accurate Comprehensive Documentation & High-Precision Highlights**
  1. **Comprehensive README.md Restructuring & Accurate Feature Matrix**: Corrected inaccurate format claims in legacy documentation (removed unintegrated OBJ/MTL, STL, PLY; focused strictly on released IFC 2x3/4/4.3, GLTF/GLB, FBX, and COLLADA .dae); systematically added Multi-Version IFC Comparison Mode, CAD-standard dual-direction marquee selection, viewport-centered elevation presets, 50-step view history, Stencil Buffer solid capping, and universal 3D animation bar.
  2. **Detailed Superior Geometric Precision & Creased Normal Smoothing**: Highlighted proprietary IFC parser strengths surpassing commercial tools: ① Full recursive mapped item traversal and Newell-Earcut triangulation solving commercial tool bugs where only topmost roof tiers render; ② Proprietary spatial-hashed creased normal reconstruction (`computeCreasedNormals`, 55° threshold) transforming faceted tessellations into smooth continuous curved surfaces while preserving sharp 90° structural edges; ③ Real-time CSG wall void cutouts and procedural expanded mesh detection.

---

## [v1.2610060030] - 2026-10-06 00:30

### Multi-Format Model Subtitle & Inspector Metadata Profile Sync
- **Unified Title Bar Engineering Subtitle & Inspector Alignment**
  1. **Unified Multi-Format Subtitle Engineering Standard**: Subtitle beneath model name dynamically displays compact engineering metadata across all supported formats (IFC, FBX, DAE, glTF/GLB, Demo Model), replacing residual architectural demo text. Standardized structure: `Format Version | Software: ... | Unit: ... (Axis) | GIS: ... (if present)`, gracefully falling back to "Unspecified".
  2. **Deep Format Metadata Extraction**: Extended `FBXLoader.js` to parse FBX version, Creator, unit scale, up-axis, and GIS coordinate reference; integrated `IFCPROJECTEDCRS`/`IFCGEOGRAPHICCRS` in `ifc_parser.js`; extracted COLLADA version, authoring tool, and geolocation in DAE loader.
  3. **Robust FBX Loader Exception Fix**: Fixed a `ReferenceError` caused by undefined variable reference in `loadFBXModel`, ensuring seamless loading and full metadata propagation for real-world FBX models.
  4. **Inspector 'Model Profile' Synchronization & Bilingual Zero-Reload Switching**: The right-hand Model Profile inspector card synchronizes fully with the header subtitle, adding "Unit & Orientation" and "GIS / Coordinate Reference". Instant bilingual language toggle dynamically re-renders both header and inspector without reloading the model.

---

## [v1.2610052300] - 2026-10-05 23:00

### Bottom Bar Elements Overflow Edge Shadow & Smooth Scroll
- **Overflow Detection & Leftward Gradient Inner Shadow**
  1. **Elements Overflow Edge Inner Shadow**: When category chips in the bottom bar overflow and collide with the right-side coordinates and performance HUD, dynamically renders a smooth leftward gradient inner shadow starting from the left boundary of the coordinates section.
  2. **Horizontal Wheel Scrolling & Dynamic Shadow Visibility**: Direct mouse-wheel horizontal scrolling over the bottom bar; continuously monitors scroll position and viewport resize, smoothly fading out the shadow when scrolled to the end.

---

## [v1.2610052230] - 2026-10-05 22:30

### CAD-Standard Marquee Box Selection & Surface-Pivot Orbit
- **Crossing Selection**
  1. **Mouse Control Layout Refactor**: Left mouse button exclusively handles click selection and marquee box drag; middle mouse drag handles Pan; right click opens context menu, while right drag performs Orbit rotating precisely around the surface point under cursor.
  2. **CAD-Standard Window vs. Crossing Selection**: Dragging to the right renders a solid blue border (Window Selection, selecting elements completely enclosed); dragging to the left renders a dashed green border (Crossing Selection, selecting elements intersecting or enclosed).
  3. **Composite Box Selection & Batch Operations**: Ctrl-drag adds to selection (Union), Shift-drag subtracts from selection (Difference). Multi-selection inspector card provides batch visibility toggle, isolation, Zoom to, unified opacity slider, and intersected property sets.

---

## [v1.2610052130] - 2026-10-05 21:30

### Stationary Sidebar Toggle Buttons & Smooth Floating Title Animations
- **Stationary Toggle Anchor & Viewport Floating Title Transitions**
  1. **Stationary Sidebar Toggle Buttons (Zero-Jump Positioning)**: Completely eliminated the 6px upward jump previously caused by hardcoded collapsed offsets. Re-engineered header layouts to maintain exact pixel coordinates (`left/right: 14px, top: 56px`) regardless of whether panels are expanded, transitioning, or collapsed.
  2. **Persistent Viewport Floating Titles & Alignment**: Sidebar titles remain visible over the 3D viewport when collapsed. Left "MODEL HIERARCHY" docks left-aligned 8px to the right of the left toggle; right "INSPECTOR" docks right-aligned 8px to the left of the right toggle.
  3. **Synchronous 0.25s Smooth Bezier Slide Animation**: Added synchronized slide transitions (`0.25s cubic-bezier(0.4, 0, 0.2, 1)`) so titles glide between their centered header positions and docked positions beside the toggle buttons during collapse/expand.
  4. **High-Contrast Text Shadows & Viewport Click-Through**: Enhanced title readability over bright 3D geometry using text drop shadows (`0 1px 4px rgba(0, 0, 0, 0.8)`), with `pointer-events: none` for uninterrupted 3D interaction.

---

## [v1.2610052050] - 2026-10-05 20:50

### Right Panel UI Streamlining & 'Zoom to' Label Alignment
- **Inspector UI Streamlining & Action Label Consistency**
  1. **Removed Redundant 'Dist' Slider from Right Panel**: Eliminated the duplicate Dist slider from the right Inspector preference card (`.inspector-pref-card`). Camera visible distance is now exclusively managed via the dedicated Left Sidebar Camera & Far Distance tab (`#tab-camera-content`), decluttering the right panel.
  2. **Renamed Inspector Selection Button to 'Zoom to'**: Renamed the right-hand element action button from "Zoom drawing" to "Zoom to" (with Chinese localization), achieving consistency with the 3D viewport context menu.

---

## [v1.2610052040] - 2026-10-05 20:40

### Pure Chroma Selection Highlight & Surface Color Uniformity Fix
- **Pure Chroma Material Refactor & Multi-Surface Uniformity**
  1. **Elimination of Sunlight Bleaching on Top Faces**: Addressed the issue where lighting-aware materials (`MeshLambertMaterial`) reacted to the scene's directional sunlight, causing top surfaces to be bleached and washed out (e.g. Magenta `#FF00FF` becoming pinkish `#ff92fa` while side and bottom faces varied). Refactored selection overlays to pure unlit `MeshBasicMaterial`.
  2. **100% Pure Chroma & Consistent Surface Hue**: Stripped away directional light interference, guaranteeing that top, side, and bottom faces all render with identical, pure chroma and 100% color saturation matching the user-selected highlight color.
  3. **Volume Definition via EdgeLines Preservation**: Preserved `renderOrder = 2000` for architectural `EdgeLines`, ensuring razor-sharp edges float cleanly over the pure highlight layer to maintain full 3D spatial depth.

---

## [v1.2610052030] - 2026-10-05 20:30

### Selection Highlight Algorithm Refactor & Edge Preservation
- **Highlight Pipeline & Multi-Tier Opacity Linearization**
  1. **EdgeLines Render Order Elevation**: Raised architectural contour edge lines (`EdgeLines`) rendering precedence from `renderOrder = 2` to `renderOrder = 2000`, while anchoring selection and hover overlays at `renderOrder = 1`. This completely eliminates the issue where highlight overlays painted over and obscured the dark architectural edges.
  2. **Eliminated Closed-Mesh Opacity Compounding**: Addressed the double-layer opacity stacking bug caused by unconditional `THREE.DoubleSide` on closed volumes without depth write. Restructured overlays to adhere to single-layer exterior surfaces (`FrontSide`), linearizing the perceived opacity progression across the entire 10% to 100% slider range.
  3. **Lighting-Aware Shading with MeshLambertMaterial**: Upgraded from unlit `MeshBasicMaterial` to lighting-responsive `MeshLambertMaterial` with subtle emissive boost (22%), preserving sunlight reflection, normal shading, and ambient occlusion for authentic 3D architectural depth.
  4. **Multi-Material Array Safety & Instant Viewport Render**: Hardened material traversal in `updateHighlightAppearance` to gracefully handle sub-mesh material arrays, ensuring instant visual feedback upon dragging the opacity slider.

---

## [v1.2610052000] - 2026-10-05 20:00

### Left & Right Panel Tabs Mouse-Wheel Scroll Stability Fix
- **Scroll-Position Retention & Anti-Springback**
  1. **Transitionend Bubbling Isolation**: Fixed an issue where CSS `opacity` transitions on inner tabs edge shadows (`.tabs-edge-shadow`) and chevron buttons bubbled `transitionend` events up to `#left-sidebar` and `#right-sidebar`, inadvertently triggering `onContainerResize()`. Now strictly guards `transitionend` handlers to only react to sidebar container's own `width` or `transform` transitions.
  2. **Decoupled Active Tab Focus from Generic Scroll & Overflow Updates**: Separated `scrollActiveSidebarTabIntoView` / `scrollActiveInspectorTabIntoView` from regular overflow and resize updates. Scrolling with mouse wheel or resizing panels will stably retain the user's horizontal scroll offset without snapping back to tab 0.
  3. **Eliminated CSS Smooth-Scroll Wheel Interference**: Removed `scroll-behavior: smooth` from `.sidebar-tabs-nav` and `.inspector-tabs-nav` to eliminate frame throttling and position truncation during rapid mouse wheel ticks, while preserving silky programmatic smooth transitions on chevron clicks and tab switching.
  4. **Dual-Axis Wheel & Trackpad Support**: Enhanced horizontal scroll responsiveness for both mouse vertical wheels (`deltaY`) and trackpad swipe gestures (`deltaX`) across left and right panels.

---

## [v1.2610051945] - 2026-10-05 19:45

### Native COLLADA (.dae) Support & Universal Animation Player
- **Native COLLADA (.dae) Format Engine**
  1. **100% Client-Side Offline Support**: Integrated official Three.js r128 `ColladaLoader.js` into the standalone single-file viewer, providing full native loading for COLLADA (`.dae`, 1.4.1 & 1.5) without backend dependencies or server transcoding.
  2. **True Metric Scale & Up-Axis Normalization**: Accurately parses `<unit meter="..."/>` and `<up_axis>` (`Z_UP`, `Y_UP`, `X_UP`), converting models to authentic metric scale with Y as elevation, guaranteeing seamless alignment with IFC and GLTF models.
  3. **DoubleSide Material Enforcement & Architectural Edges**: Forces `THREE.DoubleSide` on all DAE materials to eliminate SketchUp back-face culling holes and backface transparency artifacts. Automatically extracts coplanar-filtered architectural contour edge lines.
  4. **Dual-Mode Hybrid Hierarchy Tree**: Automatically parses architectural keywords (Wall, Slab, Column, Beam, Roof, Door, Window, etc.) into structured BIM categories; gracefully falls back to raw visual scene graph nodes for non-architectural assets.
  5. **Separated Texture Modal Integration**: Seamlessly connects to the interactive texture assembly modal when external texture files are referenced, supporting multi-batch drag-and-drop resolution or clean solid shaded fallback.

- **Universal Animation Player Bar**
  1. **Bottom-Center Floating Capsule Player**: Positioned at the bottom center of the 3D viewport with frosted glass backdrop, cyan accent glow, and compact layout, natively supporting transform and skeletal animations across **DAE, FBX, and GLTF models**.
  2. **Intelligent Visibility**: Automatically emerges when an animated model is loaded, and stays completely hidden for static models to preserve an uncluttered viewport canvas.
  3. **Comprehensive Interactive Controls**:
  - **Play/Pause Toggle**: Interactive button with animated SVG icon switching and smooth pause resumption;
  - **Time Scrubber Slider**: Millisecond-accurate timestamp display (`00:02.5 / 00:05.0`) with real-time pose scrubbing during slider dragging;
  - **Loop Mode Toggle**: Toggles between infinite repeat (`LoopRepeat`) and single-pass clamp (`LoopOnce`);
  - **Multi-Speed Cycling**: Cycles playback speed across `0.5x`, `1.0x`, `1.5x`, and `2.0x`;
  - **Multi-Clip Dropdown**: Automatically surfaces a clip selector dropdown when multiple animation tracks exist in the file.

---

## [v1.2610042233] - 2026-10-04 22:33

### Hover Feedback & Material Lighting
- **Translucent 10% White Hover Overlay**
  - Refined the 3D element cursor hover feedback. Previously, additive blending caused light-colored materials (such as standing-seam zinc roofing, concrete pads, and timber siding) to clip to solid white highlights; transitioned to standard normal blending (`NormalBlending`) with a delicate 10% translucent white overlay (`opacity: 0.10`, dialed down to 5% for transparent glass panels). Preserves the element's authentic base hue, material textures, and shadows while offering subtle, elegant interactive visual feedback.

---

## [v1.2610042226] - 2026-10-04 22:26

### Interaction Refinement & Context Menu Logic
- **Context Menu Preserves Component Selection**
  - Completely refactored the 3D viewport right-click context menu interaction logic. Removed the legacy behavior where right-clicking performed raycasting under the cursor and forcefully mutated or cleared component selection. Right-clicking now strictly preserves the active selection state without alteration. All context actions (Hide, Isolate, Zoom to, Section Box) reliably target the user's intentionally selected element even if the right-click occurs near adjacent meshes or in blank space. If no element is selected, right-clicking anywhere consistently presents the global canvas actions (Show All, Fit to Model, Reset View), eliminating unintended selection changes caused by cursor drift.

---

## [v1.2610042220] - 2026-10-04 22:20

### Redo Engine
- **50-Step Camera Navigation History Stack & Matching Rounded Button Group**
  1. Added a pair of compact View History navigation buttons—"Previous View (Undo Navigation)" and "Next View (Redo Navigation)"—immediately to the right of the `Persp` projection button within `#nav-center-views`. Styled in an identical rounded rectangular group frame (`.btn-group`, 28px height, 5px border-radius, 2px inset padding) for pixel-perfect design alignment.
  2. Implemented a zero-overhead 50-step circular camera snapshot stack (~150 bytes per snapshot, ~7.5 KB total memory footprint).
  3. Automatically tracks and debounces all camera interactions: orbit rotation, right/middle-button panning, cursor-guided wheel zooming (coalesced via 300ms debounce timer), preset view jumps (Iso, Plan, N, S, E, W), projection switching (Persp/Ortho), right-click & Inspector Zoom-to framing, Fit View resets, and 3D compass cube interactions.
  4. Wired standard CAD/BIM keyboard shortcuts `Alt+ArrowLeft` and `Alt+ArrowRight` for fluid keyboard-driven viewpoint traversal.
  5. Equipped with 350ms cubic easing tween transitions, animation cancellation protection against overlapping clicks, intelligent branch pruning upon fresh navigation, reactive disabled states at stack boundaries, and dynamic bilingual tooltips across English and Chinese.

---

## [v1.2610042205] - 2026-10-04 22:05

### Viewport & Component Framing
- **Increased Zoom to Component Occupancy to 70%**
  - Upgraded the right-click "Zoom to" and Inspector framing occupancy ratio from 50% to 70%. In both Perspective and Orthographic camera modes, the target distance and frustum bounds are computed so the component's 3D bounding sphere diameter occupies 70% of the tighter viewport dimension (screen height). Produces closer, more detailed component inspection with balanced 15% breathing margins.

---

## [v1.2610042200] - 2026-10-04 22:00

### UI Refinement & Vector Icons
- **Oblique Perspective Cube Icon & Matching Rounded Frame**
  - Upgraded the Perspective toggle (Persp) SVG icon to an oblique 2-point perspective wireframe cube, featuring a prominent foreground vertical leading edge and dynamic convergence towards lateral vanishing points. This creates an immediate, intuitive visual contrast with Ortho's parallel isometric cube. Enclosed the Persp/Ortho toggle within an identical rounded rectangular group frame (`.btn-group`, 28px height, 5px border-radius, 2px inset), ensuring full visual parity with the adjacent quick view preset bar.

---

## [v1.2610042155] - 2026-10-04 21:55

### Bug Fixes & Hierarchy Sanitization
- **Filter Clipping Stencil Helper Meshes from Model Tree & Stats**
  - Thoroughly diagnosed and resolved an issue where internal rendering helpers generated by the clipping engine's two-pass stencil capping pipeline leaked into the model hierarchy tree and statistics. For each of the ~300 solid villa meshes, 14 stencil passes (1 plane pair + 6 box face pairs = 4,200 meshes) are mounted on the scene graph. Without filtering, these were erroneously collected into a fallback `"Model Structure"` group as 4,200 `"Element"` leaves that could not be selected or zoomed to. Implemented a centralized `isModelElementMesh()` filter, completely isolating stencil gizmos from model trees, bottom legends, and geometry counters. The villa's reported triangle count dropped from an inflated 367,730 to its authentic 27,866 triangles, with authentic total elements cleanly reflected as 329.

---

## [v1.2610042146] - 2026-10-04 21:46

### Visual & Brand Identity
- **Viewport Watermark Logo (Bottom-Left Corner)**
  - Seamlessly embedded the user's custom WW monogram logo in the bottom-left corner of the 3D viewport canvas, sized at exactly 32px by 32px with 20% subtle opacity (`opacity: 0.2`) to symmetrically balance the 3D compass on the bottom right. Strictly configured with `pointer-events: none` and `user-select: none` to guarantee 100% click-through transparency, ensuring mouse orbit navigation, panning, zooming, raycast selection, context menus, and measurements operate completely unimpeded. Embedded via Base64 Data URI to uphold single-file zero-server offline portability.

---

## [v1.2610042140] - 2026-10-04 21:40

### UI Revamp & UX Enhancements
- **Top Toolbar Hierarchy Simplification & De-duplication**
  - Removed 6 redundant top toolbar panel toggles (Section, Lighting, Camera, Labels, Model, Inspector) whose hierarchies conflicted with sidebar tabs and dock toggles, establishing a clean, focused header while preserving dedicated sidebar dock/collapse buttons.
- **Viewport-Centered Dynamic View Preset Bar**
  - Retained quick camera view presets (Iso, Plan, N, S, E, W) in the top navbar and dynamically aligned their horizontal center to the exact geometric midpoint of the 3D viewport canvas. The bar smoothly tracks and realigns in real-time as left/right sidebars resize or collapse.
- **Standalone Projection Toggle & Architectural Wireframe Icons**
  - Decoupled the projection mode toggle from the directional presets into an independent button. Outfitted with high-contrast architectural wireframe SVG vector icons: a converging 1-point perspective tunnel cube for Perspective mode, and a strictly parallel isometric cube for Orthographic mode, supporting instant bilingual switching.
- **Relocated Visible Distance Slider to Inspector Card**
  - Relocated the camera visible distance (Dist) readout and slider into the inspector preferences card directly above 3D Labels. Slider width and layout strictly follow the established 115px standard, operating in full bidirectional synchronization with camera settings.

---

## [v1.2610042105] - 2026-10-04 21:05

### Added & Improved
- **Automated Cumulative Development Time Tracking**
  - Integrated an automated engineering telemetry model calculating active development hours (27.04 hours across 13 sprints, 45-min idle cutoff) from granular transcript logs. Hooked directly into the compilation pipeline to guarantee automated re-calculation upon every build.
- **Subtle Additive Brightness Boost for Hovered Elements**
  - Overhauled hover highlight visual feedback. Replaced harsh cyan wash overlay with an additive blending overlay (`THREE.AdditiveBlending`) derived strictly from the element's authentic base color and texture map. Fully preserves the element's natural hue and saturation while imparting a gentle, sophisticated luminance lift (16% opacity, 6% for transparent elements) without color distortion.
- **Dynamically Aligned Continuous Opacity Slider**
  - Introduced a continuous opacity adjustment slider (10% to 100%) in the right inspector panel directly above the action button row ("Copy Summary / Fit View / Export JSON" for model profile, and navigation buttons for selected components). The rightmost edge of the slider is dynamically and pixel-perfectly aligned with the right boundary of the button group across all sidebar widths, offering fluid real-time transparency inspection into building interiors.
- **Project Workspace Directory Structure Consolidation**
  - Consolidated the active repository into the dedicated project root `H:\\Software Develop\SWBIM Scope\`, maintaining the active Git repo `Project` and offline release folder `Deliverables`, eliminating root-level folder redundancy and obsolete mirror scripts.

---

## [v1.2610041950] - 2026-10-04 19:50

### Added
- **Perspective Camera Projection**
  - Replaced the redundant 'Fit' button in the top view preset toolbar with a direct one-click toggle between Perspective and Orthographic projection (`Persp` $\leftrightarrow$ `Ortho`), highlighting in active cyan glow when Orthographic mode is engaged.
- **Zero-Scale-Jump Seamless Mathematical Transition**
  - Mathematically preserves frustum height at the target plane during projection conversion, guaranteeing exact screen-pixel scale matching with zero visual jump.
- **Full CAD-Grade Navigation Parity in Orthographic Mode**
  - Complete interaction parity in Orthographic mode including wheel zoom-to-cursor, screen-space pan, virtual pivot orbit, responsive canvas resize updates, and architectural view presets (Plan, North, South, East, West, Iso).
- **Strict Axis-Aligned NSEW Elevation Views**
  - Eliminated the legacy 20° downward tilt pitch (`dist * 0.35`); locked camera elevation strictly to the model center height (`pos.y = center.y`) for North, South, East, and West presets, delivering 100% true horizontal, axis-aligned engineering elevations along the coordinate axes ($\pm Z$, $\pm X$).
- **Demo Model Renaming & Default Labels Off**
  - Renamed initial architectural template to `Demo Model`; defaulted floating 3D billboard pin labels to off upon loading for clean, unobstructed viewing, togglable anytime via navbar or inspector.
- **Localization & Live Feedback**
  - Full bilingual i18n synchronization for button labels, tooltip titles, and toast feedback.

---

## [v1.2610041714] - 2026-10-04 17:14

### Added
- **Round End Caps on Cut Contours**
  - Generated 16-segment in-plane circular fan discs at cut segment terminals; free openings (doors, windows, partition ends) now display smooth architectural round end caps.
- **Smooth Corner & Miter Joins**
  - Miters and corners where sliced walls meet are seamlessly joined by in-plane discs, eliminating protruding sharp notches and rectangular step artifacts.

### Improved
- **Cut Contour Thickness Halved**
  - Refined cut contour band width by 50% (half-width reduced from ~3.6cm to ~1.8cm), achieving balanced proportions and professional CAD drawing aesthetics.
- **Eliminated Centerline Dashing**
  - Disabled direct rasterization of the 1px centerline, completely resolving depth z-fighting and stippled dashed artifacts on the contour ribbons.

---

## [v1.2610041645] - 2026-10-04 16:45

### Added
- **Dynamic Stencil Section Capping**
  - Implemented real-time dynamic manifold capping for both Section Plane and 6-sided Section Box via a dual-pass WebGL Stencil Buffer pipeline.
- **45° Diagonal Screen-Space Hatching**
  - Applied architectural 45° diagonal hatching over warm golden amber base (`#d9b606`) with constant screen-space pitch (14px spacing, 1.8px width), remaining crisp across all zoom levels without moiré patterns.
- **Architectural Bold Cut Outlines**
  - Real-time extraction of triangle-plane intersections rendered as dark charcoal (`#1e293b`) perimeter boundary bands.

### Improved & Fixed
- **Open Terrain Winding Leak Prevention**
  - Excluded single-sided open terrain meshes from the stencil pass, preventing winding leaks while preserving solid architectural components.
- **Decoupled Visual Helpers**
  - Section capping and outlines operate completely independently of helper visibility toggles.

---

## [v1.2610040845] - 2026-10-04 08:45

### Added
- **Hierarchy Tree Context Menu Parity**
  - Extended viewport context menu to left hierarchy tree items and group branches (Isolate, Hide, Zoom to Group).
- **Box to here"**
  - Context menu dynamically features "Move Section Plane/Box to here", precisely placing the plane tangent to the element or tightly bounding the element with the section box.
- **Cut-away Wireframe Toggle**
  - Added a dedicated toggle to visualize sliced-off geometry in translucent wireframe mode.
- **Hide Section Helpers**
  - Added toggle to hide plane helpers, box volumes, and all gizmos for a distraction-free section view while keeping slider controls active.

### UI & Interaction Overhaul
- **Equal-Width Segmented Mode Toggle**
  - Replaced dropdown with equal-width segmented toggle buttons auto-sized to the longest label across languages.
- **Tri-State Axis Buttons**
  - Replaced axis dropdown with inline segmented buttons (X Easting, Y Northing, Z Elevation).
- **Standard Axis Colors & Yellow Hover Glow**
  - Enhanced gizmo saturation and opacity; arrows follow standard X-Red, Y-Green, Z-Blue with bright yellow hover highlight (`#ffea00`).
- **Dynamic Arrow Cut-Direction**
  - Plane gizmo arrow dynamically points toward the cut-away side and flips immediately when inverted.
- **Absolute 5-Degree Rotation Snap**
  - Snapping is now strictly locked to absolute multiples of 5° from 0° (e.g., 17° snaps to 15° or 20°).

---

## [v1.2610040430] - 2026-10-04 04:30

### UI & UX Refinement
- **Inspector Layout Redesign**
  - Centered inspector header, enabled smooth horizontal scroll for tabs with indicator gradients, and introduced collapsible accordion property groups.
- **Subtle Bi-directional Hover Glow**
  - Added subtle light-cyan hover highlight across both the 3D viewport elements and hierarchy tree items.
- **Responsive Layout & Viewport Protection**
  - Adaptive sidebar sizing protecting minimum 40% 3D viewport area; automatically collapses on small screens while preserving manual user drag overrides.

---

## [v1.2610031040] - 2026-10-03 10:40

### Geometry Engine & IFC Processing
- **CSG Wall Void Cutouts**
  - Corrected CSG boolean void cutouts for windows and concave stairs in the architectural sample model.
- **Retaining Wall Alignment**
  - Aligned north/east concrete retaining walls with topography mesh for seamless architectural fitting.

---

## [v1.2610020110] - 2026-10-02 01:10

### IFC Parser & 3D Labels
- **Zero-Server Client-side IFC Parser**
  - In-memory streaming IFC parser supporting IFC 2x3, 4, and 4.3 with complete geometry, hierarchy, and Pset extraction.
- **Viewport 3D Floating Pin Labels**
  - Interactive 3D billboard pin labels anchored to elements with camera orientation tracking and anti-flicker smoothing.

---

## [v1.2610010130] - 2026-10-01 01:30

### Core Features & Foundation
- **Standalone Single-File Compiler**
  - Established `build_viewer.py` compiler producing a single-file, 100% offline distribution (`SWBIMScope.html`).
- **Broad File Format Support**
  - Direct drag-and-drop loading for IFC, GLTF/GLB, FBX, OBJ+MTL, STL, and PLY models.
- **True 3D Viewport Compass**
  - 26-view 3D interactive compass supporting Isometric, Top/Plan, Elevations, and Perspectives.
- **ACC Virtual Pivot Orbit Controls**
  - Autodesk Construction Cloud style virtual pivot orbit rotation centered on clicked points or selection centers.
- **Solar Daylight Simulation**
  - Astronomical solar simulation calculating azimuth/altitude from coordinates for real-time 24h sunlight studies.
- **Precision 3D Measurement**
  - Vertex and surface snapping distance measurement with simultaneous 3D Euclidean distance and orthogonal offsets.
- **Full Bilingual Localization**
  - Seamless instant one-click switching between English and Simplified Chinese across all UI elements.