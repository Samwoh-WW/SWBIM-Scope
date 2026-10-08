# Features & Backlog Matrix

This document systematically organizes all features and UI elements of SWBIM Scope into a unified data table.

> **Status Legend**:  
> - `✅ Released`: Feature is implemented and verified.  
> - `🟡 In Progress`: Feature is active but undergoing active iteration.  
> - `📋 Backlog`: Accepted feature requirement in queue.  
> - `💡 Idea`: Exploratory proposal or early-stage idea.

---

## Unified Features & Backlog Matrix

| Module | Category & UI Element | Feature Name | Description | Status | Version |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **Core Platform**** | Compiler Pipeline | Standalone HTML Compiler | Compiles all libraries, shaders, and styles into a single zero-dependency file. | Released | v1.2610010130 |
| **Core Platform**** | Zero Server | Zero-Backend Offline Execution | Double-click to run in any browser without local HTTP server or backend. | Released | v1.2610010130 |
| **Core Platform**** | Deliverables Mirror | Automated Deliverables Sync | Automatically exports compiled distribution to Deliverables and root `index.html`. | Released | v1.2610010130 |
| **File Formats**** | IFC Engine | Client-side Streaming IFC Parser | In-memory streaming parsing for IFC 2x3/4/4.3 schemas with geometry extraction. | Released | v1.2610020110 |
| **File Formats**** | Standard 3D | Multi-format 3D Loaders | Drag-and-drop loading for GLTF/GLB and FBX (binary/ASCII with TGA/PNG/JPEG textures). | Released | v1.2610010130 |
| **File Formats**** | Geometry Precision | Multi-Tier Eaves & Canopies Precision | Solves commercial viewer bugs where only topmost roof tiers render; utilizes recursive mapped item stack and Newell-Earcut triangulation to render all multi-tier eaves and canopies without omission. | Released | v1.2610030100 |
| **File Formats**** | Smooth Shading | Spatial-Hashed Creased Normal Smoothing | Reconstructs smooth continuous curved surfaces on cylinders, pipes, and roofs from raw triangulated meshes while strictly preserving sharp 90° structural creases. | Released | v1.2610030100 |
| **File Formats**** | COLLADA (.dae) | Native COLLADA (.dae) Format Engine | 100% client-side parsing for COLLADA (.dae) with metric unit normalization, DoubleSide materials to prevent SketchUp back-face culling holes, and texture modal assembly. | Released | v1.2610051945 |
| **File Formats**** | Demo Template | Demo Model | Built-in architectural BIM procedural demonstration template (Demo Model). | Released | v1.2610041950 |
| **Animation**** | Animation Player | Universal Animation Player Bar | Bottom-center floating capsule player for DAE, FBX, and GLTF with play/pause, time scrubbing, loop mode, 0.5x-2.0x speeds, and multi-clip selector. | Released | v1.2610051945 |
| **File Formats**** | CSG Engine | CSG Wall Void Cutouts | Precise boolean subtraction of window and door openings from solid wall bodies. | Released | v1.2610031040 |
| **Model Coordination**** | Model Append | Federated Multi-Model Appending | Appends additional models (IFC, GLTF, FBX, OBJ, etc.) to the active viewport without clearing current model, supporting federated multi-discipline coordination with multi-root tree branches. | Backlog | Planned for v2 |
| **Model Coordination**** | Coordinate Check | Coordinate Discrepancy Detection & Placement Prompt | Detects models lacking explicit origins or with large spatial discrepancies; prompts user with placement strategies (Origin-to-Origin, Center-to-Center, Keep World Coordinates, or Launch Manual Alignment). | Backlog | Planned for v2 |
| **Model Coordination**** | Point Registration | 3-Point Pair Registration with Model Scaling | Users pick 3 matching point pairs across models; calculates optimal rigid rotation, translation, and uniform scale via Procrustes/SVD similarity transform to register models. | Backlog | Planned for v2 |
| **Model Coordination**** | Plane Constraint | 3-Plane Constraint Rigid Alignment (Scale-Invariant) | Users pick 3 pairs of non-parallel planar faces on both models; solves 6-DOF rigid transformation (3 rotation, 3 translation) using plane normals and distance constraints without any scaling. | Backlog | Planned for v2 |
| **Spatial Transformation**** | Translation | Manual Model & Element Translation | Manually translate entire models or selected elements along axes via 3D transform gizmo or numeric coordinate inputs. | Backlog | Planned for v2 |
| **Spatial Transformation**** | Position Reset | Revert to Default / Initial Position | One-click reset to restore models or moved elements back to their initial world positions and original imported transforms. | Backlog | Planned for v2 |
| **Spatial Transformation**** | Base Point | Custom Translation Base Point Selection | Allows picking a custom base point/pivot on geometry rather than relying on default bounding box centers for precision snapping. | Backlog | Planned for v2 |
| **Spatial Transformation**** | Snapping Engine | 3D Geometric Snapping (Vertex/Edge/Face/Axis) | High-precision 3D snapping to vertices, edge midpoints, face surfaces, and orthogonal axes during translation for CAD-grade accuracy. | Backlog | Planned for v2 |
| **Model Comparison**** | Compare Engine | Multi-Version Homogeneous Model Comparison | Loads a secondary model of the same file format but differing revisions/stages for in-memory geometric topology and metadata comparison. In comparison mode, all element textures are stripped in favor of high-contrast engineering semantic colors: unchanged elements appear in neutral gray-white, added elements in vivid green, deleted elements in red translucent, and modified elements in orange-yellow. | Released | v1.2610072000 |
| **Model Comparison**** | Ghost Geometry | Interactive Pre-Revision Ghost Geometry Overlay | Intelligently differentiates between geometric/spatial shifts and metadata-only parameter changes: selecting a modified (orange-yellow) element whose geometry or position changed displays a yellow translucent ghost overlay depicting its pre-revision shape and location; metadata-only modified elements do not render a ghost shape. | Released | v1.2610072000 |
| **Model Comparison**** | Comparison Tree & HUD | Tri-Color Metrics HUD & Dual-Mode Difference Tree | Left sidebar dynamically switches to dedicated Comparison Results view; header displays green, red, and orange rounded metric pills showing precise component count breakdown. Below is a focused difference tree with two toggleable hierarchies: ① Unified Tree: organizes modified elements by original spatial hierarchy with colored status badges; ② Status Grouped Tree: groups by Added (Green), Deleted (Red), and Modified (Orange) sections while maintaining nested element hierarchies within each group. | Released | v1.2610072000 |
| **Navigation**** | Orientation Cube | True 3D Interactive Compass | 26-orientation 3D compass widget supporting Isometric, Plan, and Elevations. | Released | v1.2610010130 |
| **Navigation**** | Orbit Controls | ACC Virtual Pivot Orbiting | Autodesk-style orbit controls pivoting on clicked surface point or selection center. | Released | v1.2610010130 |
| **Navigation**** | Preset Views | Viewport-Centered Camera View Presets | One-click switching for Iso, Plan, and axis-aligned horizontal elevations (N, S, E, W); dynamically and pixel-perfectly centered relative to 3D viewport canvas across all sidebar widths. | Released | v1.2610042140 |
| **Navigation**** | Camera Projection | Standalone Ortho/Persp Toggle & Wireframe Icons | Standalone projection toggle button equipped with architectural wireframe SVG icons: converging 1-point perspective cube vs parallel isometric cube, with zero scale jump during switching. | Released | v1.2610042140 |
| **Inspector**** | Visible Distance | Inspector Visible Distance Slider & Unified Width | Visible distance readout and slider relocated into inspector preferences card directly above 3D Labels, perfectly aligned with 115px slider standard and bidirectionally synced with camera tab. | Released | v1.2610042140 |
| **Navigation**** | Labels System | 3D Floating Pin Labels | Defaulted to off; billboard pin labels anchored to elements with anti-flicker smoothing, togglable via inspector preferences. | Released | v1.2610041950 |
| **Hierarchy Tree**** | Structures Tab | Structure Category Grouping | Hierarchical classification by architectural and engineering disciplines. | Released | v1.2610010130 |
| **Hierarchy Tree**** | Levels Tab | Building Storey / Level Views | Filter and inspect components partitioned by building levels and elevations. | Released | v1.2610010130 |
| **Hierarchy Tree**** | Elements Tab | Spatial Elements Breakdown | Full spatial element tree with search filtering and double-click framing. | Released | v1.2610010130 |
| **Hierarchy Tree**** | Batch Controls | Visibility & Opacity Sliders | One-click show/hide all, individual toggles, and smooth layer opacity sliders. | Released | v1.2610010130 |
| **Hierarchy Tree**** | Context Menu | Hierarchy Tree Context Menu | Full right-click context menu parity between hierarchy tree and 3D viewport. | Released | v1.2610040845 |
| **Core Platform**** | Telemetry & Metrics | Automated Development Time Tracking | Automated telemetry calculating active development hours from step timestamps into changelog upon every build. | Released | v1.2610042105 |
| **Hierarchy Tree**** | Hover Highlight | Bi-directional Additive Hover Glow | Additive luminance hover boost preserving original element hue and saturation across both 3D meshes and tree items. | Released | v1.2610042105 |
| **Inspector**** | Basic Profile | Component Profile & Parameters | Centered header displaying IFC class, GUID, discipline, elevation, and dimensions. | Released | v1.2610040430 |
| **Inspector**** | Opacity Slider | Dynamically Aligned Opacity Slider | Continuous opacity slider (10%-100%) above action buttons in model profile and selected component cards, with its rightmost edge dynamically aligned with the action button row, enabling real-time see-through inspection. | Released | v1.2610042105 |
| **Inspector**** | Property Sets | Collapsible Pset Accordions | Collapsible accordion groups displaying all IFC Property Sets and metadata. | Released | v1.2610040430 |
| **Inspector**** | Clipboard Action | One-Click Value Copying | Instant one-click clipboard copying for any metadata key-value row. | Released | v1.2610040430 |
| **Inspector**** | Tab Navigation | Scrollable Inspector Tabs | Smooth horizontal scrolling tab container with gradient scroll indicators. | Released | v1.2610040430 |
| **Material System**** | PBR Material Override | Custom PBR Material Override & Inspector Panel Tuning | Allows overriding or replacing the original material of selected component(s) with a user-customized Physically Based Rendering (PBR) material. Provides a dedicated right-hand inspector panel with real-time tuning controls for Base Color, Metalness, Roughness, Clearcoat, Transmission/Glass, Emissive, Normal Scale, Wireframe, and Environment Reflection, accompanied by preset libraries (Chrome, Frosted Glass, Concrete, Timber, Matte Paint) and one-click reset to restore the original material. | Backlog | Planned for v2 |
| **Selection System**** | Click Selection | Ctrl Multi-Select & Deselect Toggle | Hold Ctrl and click elements to toggle selection; hold Shift and click to remove from active selection. | Released | v1.2610052230 |
| **Selection System**** | Depth Cycling | In-Place Raycast Depth Selection Cycling | Left-clicking selects the foremost element along the cursor ray; clicking again without moving the mouse cycles through occluded elements deeper along the line of sight ($E_1 \to E_2 \to \dots \to E_n \to E_1$). Moving the mouse resets the cycle. | Backlog | Planned for v2 |
| **Selection System**** | Box Selection | Mouse Left-Drag Marquee Box Selection | Left-click drag in 3D viewport to marquee box-select elements, replacing active selection; clicking empty space clears selection. | Released | v1.2610052230 |
| **Selection System**** | Composite Selection | Box Selection Boolean (Add & Subtract) | Hold Ctrl and drag to add box-selected elements to current selection (Union); hold Shift and drag to remove box-selected elements (Subtract). | Released | v1.2610052230 |
| **Selection System**** | Window vs Crossing | Window (Right) vs Crossing (Left) Selection Rule | CAD-standard window/crossing selection: dragging to the right displays solid blue border (Window Selection, selects elements completely enclosed); dragging to the left displays dashed green border (Crossing Selection, selects elements intersecting or enclosed). Multi-selection inspector card provides batch visibility, isolation, zoom to, batch opacity slider, and intersected property sets with "multiple" indicators. | Released | v1.2610052230 |
| **Sectioning**** | Mode Toggle | Equal-Width Clipping Mode Toggle | Equal-width segmented toggle buttons between Section Plane and Section Box. | Released | v1.2610040845 |
| **Sectioning**** | Axis Selection | Tri-State Axis Buttons | Inline segmented buttons (X Easting, Y Northing, Z Elevation) with auto-enable. | Released | v1.2610040845 |
| **Sectioning**** | Gizmo Controls | Standard Axis Colors & Hover Glow | Gizmos follow X-Red, Y-Green, Z-Blue with bright yellow hover highlight. | Released | v1.2610040845 |
| **Sectioning**** | Gizmo Controls | Dynamic Arrow Cut Direction | Plane gizmo arrow dynamically points toward the cut side and flips with Invert. | Released | v1.2610040845 |
| **Sectioning**** | Rotation Snap | Absolute 5-Degree Rotation Snap | Rotation snap is locked to absolute 5° multiples from 0° (e.g. 17° to 15°/20°). | Released | v1.2610040845 |
| **Sectioning**** | Context Alignment | "Move Section Plane/Box to here" | Adapts section plane tangent to element or snaps section box tightly around it. | Released | v1.2610040845 |
| **Sectioning**** | Wireframe Mode | Cut-away Wireframe Toggle | Visualizes the sliced-off geometry in translucent wireframe mode. | Released | v1.2610040845 |
| **Sectioning**** | Helpers Toggle | Show/Hide Section Helpers | Hides plane grids, box helpers, and gizmos for a clean view while keeping sliders active. | Released | v1.2610040845 |
| **Sectioning**** | Stencil Capping | Dynamic Stencil Section Capping | Real-time manifold capping for Section Plane and Section Box using Stencil Buffer. | Released | v1.2610041645 |
| **Sectioning**** | Hatch Pattern | 45° Diagonal Screen-Space Hatching | Screen-space constant 45° diagonal architectural hatching over golden base. | Released | v1.2610041645 |
| **Sectioning**** | Cut Contour | Architectural Bold Cut Outlines | Refined perimeter edge contour bands (~1.8cm half-width) in dark charcoal. | Released | v1.2610041714 |
| **Sectioning**** | Cut Contour | Round End Caps & Smooth Joins | 16-segment circular fan discs forming round end caps and smooth miter joins. | Released | v1.2610041714 |
| **Measurement**** | Snapping Engine | Vertex & Surface Snapping | Automatic raycast snapping to 3D vertices and planar surfaces. | Released | v1.2610010130 |
| **Measurement**** | Distance Readout | 3D Euclidean & Delta XYZ Offsets | Simultaneous readout of 3D spatial distance and orthogonal coordinate delta values. | Released | v1.2610010130 |
| **Measurement**** | Point Coordinate | Single-Point 3D Coordinate Measurement | Places a temporary 3D point marker on geometry and directly displays its real-time world coordinates $(X, Y, Z)$ and elevation in the viewport. | Backlog | v1 () |
| **Measurement**** | Two-Point Measure | Two-Point Distance & Dual-Angle Analysis | Picks 2 points to display Euclidean distance, $\Delta X/\Delta Y/\Delta Z$ offsets, pitch angle to the horizontal plane, and yaw angles relative to X/Y axes in both viewport and right inspector panel. | Backlog | v1 () |
| **Measurement**** | Polyline Measure | Polyline Multi-Point Cumulative Length Measurement | Click multiple points to draw a 3D polyline path, dynamically dimensioning segment lengths and computing cumulative linear length/perimeter. | Backlog | v1 () |
| **Measurement**** | Angle Measure | 3-Point 3D Angle & Planar Projected Angle Measurement | Picks 3 points (Start, Vertex, End) to measure spatial 3D angle and simultaneously compute its 2D projected angle on the horizontal ground plane. | Backlog | v1 () |
| **Measurement**** | Slope / Grade | Planar Maximum Slope & Grade Measurement | Place 1 point on a planar face (roof, ramp, terrain) to compute its maximum gradient/slope from surface normal, simultaneously reporting in architectural ratio ($1:X$), angle degrees ($\alpha^\circ$), and grade percentage ($\%$). | Backlog | v1 () |
| **Measurement**** | Visual Snap Cue | Snapping Engine with Visual Snap Type Badges | Equips all measurement tools with geometric snapping, rendering dynamic graphic badges to visually inform users of the snapped feature type (Vertex, Midpoint, Surface, Intersection). | Backlog | v1 () |
| **Solar Engine**** | Solar Algorithm | Astronomical Solar Calculations | Real-time calculation of solar azimuth and elevation angles from coordinates. | Released | v1.2610010130 |
| **Solar Engine**** | Sun Simulation | 24-Hour Daylight Simulation Slider | Continuous interactive daylight simulation with real-time shadow projection. | Released | v1.2610010130 |
| **Edge Lines**** | Edge Extraction | Coplanar Multi-Triangle Filtering | Filters out coplanar triangulation lines to display clean CAD-style geometry edges. | Released | v1.2610010130 |
| **Edge Lines**** | Edge Styling | Edge Line Intensity & Angle Sliders | Adjustable edge intensity slider and crease angle threshold. | Released | v1.2610010130 |
| **UI / UX**** | Responsive Layout | Responsive Layout with Viewport Protection | Adaptive layout safeguarding $\ge 40\%$ viewport; auto-collapses on small screens. | Released | v1.2610040430 |
| **UI / UX**** | Theme & Styling | Modern Dark Engineering Theme | Professional dark UI theme optimized for long-session CAD/BIM inspection. | Released | v1.2610010130 |
| **UI / UX**** | Localization | Full Bilingual Localization (EN) | Instant zero-reload language switching between English and Simplified Chinese. | Released | v1.2610010130 |
| **UI / UX**** | Bottom Bar | Elements Overflow Edge Shadow & Smooth Scroll | When bottom Elements category chips overflow and collide with the right-side coordinates HUD, renders a leftward gradient edge shadow from the left edge of coordinates HUD; supports direct mouse wheel horizontal scrolling and dynamically toggles shadow based on scroll position and screen resize. | Released | v1.2610052300 |
| **UI / UX**** | Model Subtitle & Profile | Unified Multi-Format Subtitle & Metadata Sync | GLB  Procedural Demo IFC 、、 GIS  ` \ | : ... \ | : ... () \ | Title bar subtitle beneath model name dynamically displays unified metadata for all supported formats (IFC, FBX, DAE, glTF/GLB, Procedural Demo), replacing initial demo text upon loading new models: compact standard format (Format Version \ | Software: ... \ | Unit: ... (Axis) \ | GIS: ... if present), graceful fallback to 'Unspecified', full synchronization with right-hand Model Profile inspector card, and instant bilingual toggle. | Released | v1.2610060010 |

---

## Backlog Workflow

When you suggest new feature ideas, UX refinements, or enhancements:
1. **Instant Addition**: Added to this matrix with `📋 Backlog` or `💡 Idea` status;
2. **Lifecycle Tracking**: Marked as `🟡 In Progress` during active development, and `✅ Released` upon full verification with version number (`v1.<YYMMDDHHMM>`);
3. **Release Notes Sync**: Formally documented in [`CHANGELOG.md`](./CHANGELOG.md).
