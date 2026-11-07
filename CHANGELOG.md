# Changelog

This document records all formal version iterations and major changes of SWBIM Scope since project initiation.

> **Versioning Convention**:  
> - Major version is fixed at `v1` (displayed as `v1` in everyday usage);  
> - Full sub-version follows `v1.<YYMMDDHHMM>`, where the 10-digit timestamp represents Year, Month, Day, Hour, Minute.

---

## Development Time Metrics

> ⏱️ **Total Active Development Time**: **86 Hours 11 Minutes (86.20 Hours)**  
> 📅 **Total Calendar Span**: **39 Days 0 Hours 31 Minutes** (2026-09-29 22:17 to 2026-11-07 22:49)  
> 🔢 **Total Engineering Steps**: **34,918 Steps** (across 39 active development sprints)  
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
| **2026-10-07** | 18:43~22:04, 23:03~23:05 | 3h 23m (3.39h) | Multi-version IFC comparison engine, 4-color diff & ghost mesh |
| **2026-10-08** | 13:25~13:42, 21:37~21:46 (3 sessions) | 0h 46m (0.77h) | Difference tree, property diff table & comparison safety guards |
| **2026-10-09** | 22:06~01:14 | 3h 07m (3.13h) | IFC geometry optimizations & smooth creased normal reconstruction |
| **2026-10-10** | 19:58~22:21 | 2h 23m (2.39h) | IFC recursive mapped item multi-tier roof fixes & deep pset extraction |
| **2026-10-11** | 00:31~01:54, 19:41~19:55 (5 sessions) | 5h 34m (5.58h) | Progressive Web App (PWA) offline deployment & Service Worker caching |
| **2026-10-12** | 22:26~01:18 | 2h 51m (2.85h) | Comprehensive documentation alignment & multi-format metadata governance |
| **2026-10-16** | 23:32~00:20 | 0h 47m (0.80h) | Architecture & codebase health audit, security & performance review |
| **2026-10-25** | 17:41~22:51 | 5h 10m (5.18h) | Smart radius, arc & sphere measurement, CAD-grade badges, 3D point & slope |
| **2026-10-26** | 21:24~21:27 | 0h 02m (0.04h) | Development guidelines & 3D geometry snapping invariants established |
| **2026-10-27** | 19:50~20:35, 21:25~00:21 | 3h 40m (3.67h) | 3D distance & angle measurement, XYZ offsets, pitch/yaw/bearing |
| **2026-10-28** | 21:15~01:33 | 4h 18m (4.31h) | Multipoint polyline & 3D polygon area measurement, self-intersection scarlet alert, 3-way multi-repo publishing pipeline |
| **2026-11-05** | 20:40~23:30 | 2h 50m (2.83h) | Dual-scheme hotkeys, candidate popup, smooth zoom navigation & help manual refactor |
| **2026-11-06** | 19:47~20:39, 22:52~03:19 | 5h 18m (5.32h) | Changelog comprehensive update & metrics engine overhaul |
| **2026-11-07** | 10:25~19:17, 20:23~22:49 | 11h 17m (11.29h) | Feature development |

---

## [v1.2611070315] - 2026-11-07 03:15

### In-Place Look Around, Wheel Zoom Interior Pass-Through, Double-Click Penetration & Geometry Topology Filtering
- **In-Place Look Around (Shift + Right Drag or Left + Right Drag)**
  1. **Absolute Camera Position Invariance & Natural Head Turn**: Added look-around navigation triggered via Shift + Right Drag or chorded Left + Right Drag. Camera 3D world position remains strictly stationary while yaw and pitch orientation smoothly rotates with polar angle safety clamp and zero horizon roll.
  2. **Immediate Event Lifecycle Reset**: Overhauled pointer state lifecycle so chorded button releases instantly restore standard interaction flags, eliminating dead clicks.

- **Wheel Zoom Pass-Through & Double-Click Component Penetration**
  1. **Wheel Zoom Interior Pass-Through**: When zooming into a surface reaches the threshold distance (< 0.5m), subsequent forward wheel rolls step the camera 1.2m forward along the cursor ray directly into building interiors.
  2. **Double-Click Approach & Secondary Penetration**: Double-clicking any visible component smoothly animates the camera to 1.0m from the clicked surface while strictly preserving element selection; double-clicking again at close range (< 1.35m) casts double-sided penetration rays to find the exit surface and flies the camera to 1.0m behind it.

- **IFC Geometry Topology Cleanup & Section Plane Robustness**
  1. **CSG Void Coplanar T-Junction Line Suppression**: Implemented topology pairing and overlap filtering for coplanar CSG void subtraction seams, eliminating non-physical edge lines.
  2. **Section Fill & Context Menu Timing**: Enhanced section plane capping for non-watertight geometry and decoupled orbit drag release from context menu invocation to prevent spurious menu triggers.

---
## [v1.2611052330] - 2026-11-05 23:30

### Dual-Scheme Hotkey System, Candidate HUD Popup, Smooth Framing Transitions & Overhauled Help Manual
- **Dual-Scheme Hotkey Architecture & One-Click Toggle Pill**
  1. **Dual-Scheme Architecture (Single-Key & Two-Key Revit Standard)**: Implemented two comprehensive hotkey paradigms: ① "Single-Key Mode" triggered by direct single keystrokes (e.g. `D` for measure, `O` for ortho/persp, `F` for zoom fit, `S` for section plane), optimized for rapid single-handed navigation; ② "Two-Key Mode" adhering strictly to industry-standard Autodesk Revit keyboard conventions (e.g. `HH` hide element, `HI` isolate element, `HR` reset hide/isolate, `SD` shaded display, `HL` hidden line, `BX` selection section box, `ZX` zoom to selection, `ZA` zoom all).
  2. **One-Click Toggle Pill in Inspector Header**: Added a sleek dual-segment pill button (`Single Key` / `Two Key`) immediately to the right of the Shortcuts title in the inspector panel; clicking either side seamlessly toggles to the other scheme, with user preferences persisted locally.
  3. **Full Shortcuts Cheatsheet HUD**: Clicking the cheatsheet button reveals an interactive full-screen modal displaying comprehensive side-by-side keybinding tables for both schemes with full naming designations.

- **Keyboard Dual Execution**
  1. **Vertical Candidate Panel Above Capsule HUD**: Dynamically expands a matching candidate list panel (`#shortcuts-candidate-panel`) directly above the bottom-center feedback capsule (`#shortcuts-key-capsule`). In Single-Key mode, pressing `D` displays `D _` with 5 measurement submodes stacked above (`1: Distance`, `2: Angle`, `3: Radius`, `4: Polyline`, `5: Area`); in Revit Two-Key mode, typing the first prefix (e.g. `H`) displays `H _` along with all matching candidate commands (`HI: Isolate Selected`, `HH: Hide Selected`, `HR: Reset Hide/Isolate`).
  2. **Mouse-Clickable & Keyboard-Executable Dual Control**: Users can either tap the second hotkey key to execute immediately or hover and click candidate items directly with the mouse cursor, bridging keyboard speed and visual discovery.
  3. **5-Second Extended Retention & Fast View Decoupling**: Extended the candidate panel and capsule retention window to 5 seconds (`5000ms`) for comfortable review and mouse interaction; decoupled instant view presets (`T`/`F`) which retain a crisp 650ms auto-commit timer to avoid lag during rapid navigation; supports instant dismissal via `Esc` key or viewport backdrop clicks.
  4. **Reduced Capsule Typography**: Downsized the floating HUD capsule font by one step (`12px`, padding `5px 12px`), matching professional CAD interface ergonomics.

- **Unified Smooth Camera Transitions & Help Manual Overhaul**
  1. **Page Down Zoom to Selection**: Unified single-key framing shortcut to `Page Down` across both Single-Key and Two-Key modes, advancing perspective and orthographic cameras to frame the selected entity at 70% viewport occupancy.
  2. **Page Up Smooth Zoom to Fit**: Unified global framing shortcut to `Page Up` across both schemes; replaces jarring instantaneous viewport snaps with a smooth 450ms cubic-bezier camera fly-in transition.
  3. **Comprehensive Help Manual Restructuring**: Modernized `help_system.js` to align with latest UI paradigms; updated Section 4 with all 5 measurement workflows, CAD-grade snapping glyphs, and self-intersection triangulation; streamlined Section 7 to focus on scheme switching, HUD capsule feedback, and candidate popups with direct interactive trigger buttons.
  4. **Non-Obstructive Responsive Sliding Toolbar**: Floating tools panel smoothly glides when the right inspector collapses while preserving safe clearance margins so as never to occlude the restore toggle button; cleaned dynamic HUD measurement headers and formalized `3D Area (est.)` estimation readouts.

---

## [v1.2610290130] - 2026-10-29 01:30

### Multi-Point Polyline, 3D Polygon Area & Self-Intersection Scarlet Alert
- **Multi-Point Continuous Polyline Measurement**
  1. **Continuous 3D Polyline Drafting**: Introduced the 4th measurement submode "Polyline", enabling sequential multi-point clicks across geometry surfaces, vertices, and edges to construct an interactive 3D polyline network.
  2. **Segment-by-Segment 3D Dimension Badges**: Automatically calculates authentic Euclidean distances between adjacent vertices, anchoring compact dimension badges at segment midpoints with screen-space pixel locking and Liang-Barsky viewport clamping.
  3. **Cumulative Perimeter & Real-Time Undo**: Computes running cumulative perimeter displayed on the terminal endpoint badge; supports `Backspace` to undo the previous vertex, `Enter` or double-click to close the path, and `Esc` to commit and retain the 3D dimensions.

- **3D Best-Fit Plane & Newell-Earcut Triangulation Area**
  1. **Enclosed Polygon Surface Area Engine**: Introduced the 5th measurement submode "Area", supporting 3 or more spatial control points enclosing arbitrary 3D coplanar or non-coplanar polygonal boundaries.
  2. **Newell 3D Best-Fit Plane Projection**: Employs Newell's method to compute optimal spatial plane normals from boundary vertices, projecting 3D points orthogonally onto a 2D local coordinate system.
  3. **Mapbox Earcut Triangulation**: Integrates Mapbox Earcut triangulation to robustly partition arbitrary concave/convex polygons into non-overlapping triangle meshes, calculating total surface area and perimeter; supports one-click copying and metric/imperial unit conversion ($m^2 \leftrightarrow 	ext{sq ft}$).

- **Topological Self-Intersection Detection & Scarlet Alert**
  1. **Real-Time Boundary Intersection Detection**: Continuously monitors boundary edge segments during drawing to detect non-endpoint intersection crossovers (e.g. figure-eight or overlapping loop topologies).
  2. **Instant Scarlet Alert Styling**: Flips polygon fill mesh and boundary contour lines from calm cyan to vivid Scarlet Red (`#ef4444`) upon intersection detection, displaying cautionary feedback on the HUD badge to prevent erroneous area interpretations.

- **Plan A Multi-Repo Synchronized Publishing Pipeline**
  1. **Unified Multi-Repo Publishing Pipeline (`publish_all.py`)**: Established an automated multi-repository publishing suite adhering to Windows Credential Manager account isolation (Plan A): Variant A to `wwbim/BIM-Scope.git` (main), Variant B Deliverables to `samwoh/SWBIM-Scope.git` (main), and Variant B Source to `Samwoh-WW/SWBIM-Scope.git` (main).
  2. **Compilation Verification & SHA Matrix Summary**: Automates dual-variant single-file compilation, telemetry updates, working tree sanitation, and git push across all remotes, printing a verified 3-way commit SHA summary.

---

## [v1.2610280020] - 2026-10-28 00:20

### 3D Two-Point Distance (XYZ Offsets), Three-Point Angle & Geometry Snapping Invariants
- **Yaw Analysis**
  1. **3D Euclidean Distance & Orthogonal Bounding Guides**: Measures spatial distance with a centered numeric badge along the primary dimension line, complemented by automated 3D orthogonal bounding dashed guides decomposing XYZ projections.
  2. **ΔX, ΔY, ΔZ Offsets & Elevation Deltas**: Reports exact component offsets in the HUD card: $\Delta X$ (Easting), $\Delta Y$ (Vertical Elevation Delta), and $\Delta Z$ (Northing), color-coded with standard red/green/blue axis markers.
  3. **Sightline Pitch & Compass Bearing (Yaw)**: Calculates spatial sightline pitch/slope angle against the horizontal ground plane (in degrees and grade percentage) and true-north horizontal azimuth bearing (Yaw), addressing structural and civil inspection workflows.

- **Three-Point 3D Spatial Angle & Projected Horizontal Angle**
  1. **Three-Point Angle Calibration**: Introduced the "Angle" measurement mode, capturing points A, vertex B, and point C sequentially across 3D surfaces.
  2. **Spatial Angle & Horizontal Projection Angle**: Solves true 3D spatial angle ($0^\circ \sim 180^\circ$) via vector dot products, alongside horizontal projection angles for architectural layout verification.
  3. **Spatial Arc Sector & Angle Badge**: Dynamically constructs an anti-aliased coplanar circular arc sector and bisector dimension badge anchored at vertex B.

- **CAD-Grade Geometric Snapping Invariants**
  1. **Geometric Snapping Glyphs**: Full CAD-standard snap indicators: Endpoint (□), Midpoint (△), Center (⨁), and Nearest on edge (⧗).
  2. **Elimination of Screen-Space Re-Interpolation**: Strict enforcement of 3D geometric invariants, prohibiting 2D screen-pixel interpolation for edge projection, employing 3D ray-to-segment perpendicular distance solving to prevent 0.2m perspective drift.
  3. **Normal Culling & Line-of-Sight Occlusion Testing**: Filters backfacing geometry via normal dot products and conducts camera-to-candidate raycast occlusion testing (`isPointOccluded`) with clipping plane awareness and adaptive 5mm-40mm safety buffers.

---

## [v1.2610252230] - 2026-10-25 22:30

### Smart Radius, Arc & Sphere Measurement System
- **Arc Detection & Least-Squares Sphere Fitting**
  1. **Arc Loop & Closed Circle Adaptive Detection**: Automatically inspects mesh geometric feature rcLoops, calculating ray-to-segment distances to snap onto circular perimeters, accurately computing 3D center coordinates, normal vectors, and radius.
  2. **Local Least-Squares Curvature Sphere Fitting**: For spherical and double-curved geometries, queries 2-ring topological vertex neighborhoods and solves a 4x4 linear system via Gaussian elimination to determine optimal sphere center and radius with adaptive RMSE thresholds.
  3. **Convex/Concave Awareness & Far-Side Inward Arrow**: Evaluates spatial alignment between surface normal and camera vector; for convex surfaces where centers lie inside/behind geometry, places solid dimension arrows outside pointing inward toward the contact point, accompanied by dashed extension lines to the hidden center.

- **CAD-Standard Dimensions & Sleek Single-Number Value Badge**
  1. **Screen-Space Pixel Scaling & Billboard Alignment**: Refactored the update guard to continuously lock measurement marker components to crisp, compact screen pixels (10px standard) across camera rotations, zooms, pans, and window resizes, eliminating oversized 1:1 meter-scale 3D meshes.
  2. **CAD-Standard Center Mark (⨁)**: Anchors circle centers with standard crosshair ticks and center dot that dynamically billboard to face the camera, distinctly identifying center points without distracting oversized rings.
  3. **Sleek Single-Number Value Badge on Arrow**: Replaces bulky card panels and redundant buttons with a single compact pill badge centered on the dimension arrow line (e.g., R 75 mm or R 0.075 m, responsive to active units); single click copies full radius/diameter/coordinates, Shift+click deletes.
  4. **Liang-Barsky Clamping & Viewport Edge Protection**: Utilizes 2D Liang-Barsky line clipping to smoothly slide the dimension badge along the arrow within viewport bounds, preventing badges from clipping off-screen.

- **3D Point Measurement, Slope Analysis & PWA Offline Support**
  1. **3D Point Measurement & Elbow Leader Lines**: Click any geometry surface to anchor a 3D coordinate marker connected via dynamic SVG elbow leader lines to a compact card displaying absolute (X, Y, Z) coordinates and elevation, with drag-and-drop label repositioning.
  2. **Steepest Descent Arrow & Surface Slope Readouts**: Extracts surface normals to project a vivid yellow arrow indicating steepest descent, reporting slope in engineering ratios (1:X) and grade percentages.
  3. **CAD-Grade Geometric Snapping Engine**: Snaps to geometric vertices (Endpoint), edge midpoints (Midpoint), circle centers (Center ⨁), and nearest edge lines (Nearest ⧗) with AutoCAD-style graphical glyphs.
  4. **Progressive Web App (PWA) Offline Launch**: Integrated manifest.json and Service Worker offline caching, allowing one-click installation as a standalone desktop/mobile app without network dependencies.

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