# SWBIM Scope 🏗️

> **A Pure Client-Side, 100% Offline Standalone Web BIM & 3D Architectural Viewer**  
> Powered by Three.js • Zero Backend Dependency • Single-File Portable Distribution

---

## 🌟 Key Highlights & Engineering Breakthroughs

### 1. 🔍 Multi-Version IFC Model Comparison Engine
- **Top Compare Entry & Dual-Zone Setup Modal**: Dedicated primary entry in top navbar with full-screen frosted glass backdrop; left drop zone in subtle green (`#f0fdf4`) for New Revision (pre-populating active model), right zone in subtle red (`#fef2f2`) for Old Baseline, with center `⇄` one-click swap button.
- **Viewport Drag Conflict Elimination**: Full-screen modal mask intercepts drag events completely, preventing the bug where dragging files across the 3D viewport falsely triggered and stuck the viewport's drop prompt overlay.
- **Zero-Similarity Exception Circuit Breaker**: Halts diff pipeline when two models share 0% match (indicating accidental file mis-selection or unrelated projects), alerts user via high-priority toast, and non-destructively restores comparison modal with chosen file slots preserved.
- **GlobalId Alignment & Semantic Diff Coloring**: Matches entities via IFC standard `GlobalId` and geometric hashes; automatically strips original textures in favor of high-contrast engineering diff colors: Unchanged (neutral gray-white), Added (vivid green `#22c55e`), Deleted (translucent red `#ef4444`), and Modified (amber orange `#f59e0b`).
- **Interactive Pre-Revision Ghost Geometry Overlay**: Intelligently distinguishes geometric/spatial displacements from parameter-only changes. Selecting a modified component with spatial shift renders its pre-revision shape and position as a yellow translucent ghost overlay in the 3D viewport; metadata-only modified components do not render ghost geometry.
- **Dual-Mode Difference Tree & Metrics HUD**: Left panel dynamically switches to dedicated difference view with green/red/orange metric pills; toggles seamlessly between "Unified Spatial Hierarchy" (with status badges) and "Status Grouped" (Added / Deleted / Modified cards).

### 2. 💎 Superior Geometry Precision & Smooth Shading
- **Multi-Tier Eaves & Canopies Precision**: Solves commercial BIM viewer bugs where only topmost roof tiers render due to flawed nested mapping traversal; employs recursive mapped item stack and Newell-Earcut triangulation to faithfully reconstruct all multi-tier eaves, canopies, and non-convex roof geometry without data loss.
- **Proprietary Spatial-Hashed Creased Normal Smoothing (`computeCreasedNormals`)**: Eliminates faceted, fragmented triangle meshes from raw IFC tessellations (`IFCTRIANGULATEDFACESET` / `IFCFACETEDBREP`); custom spatial-hash-accelerated normal reconstruction (`creaseAngle = 55°`) renders curved surfaces (cylinders, curved roofs, pipes) as smooth, continuous surfaces while strictly preserving crisp 90° structural creases on walls and slabs.
- **CSG Wall Void Cutouts**: In-memory client-side CSG boolean subtraction engine cutting precise window and door openings from solid wall bodies, completely eliminating geometry penetration clipping glitches.
- **Intelligent Expanded Metal Mesh**: Automatically detects thin mesh panels via aspect ratio and material tags, procedurally applying seamless diamond wire grid alpha cutouts without downloading external textures.

### 100% Client-Side & Zero-Server Offline
- **Single-File Portable Distribution**: Compiles all libraries, shaders, icons, and styles into a single standalone `.html` file (`SWBIMScope.html`) via automated Python compiler.
- **Zero Backend Dependency**: Double-click to run in any browser without local HTTP servers; all parsing and rendering occur in browser memory, keeping model files 100% private and offline.

### 4. 📐 Multi-Format 3D Engine
- **IFC** (`.ifc` schema 2x3, 4, 4.3): High-performance streaming parsing, geometry extraction, Property Sets (Psets), spatial hierarchy, and type definitions.
- **GLTF / GLB** (`.gltf`, `.glb`): Binary and JSON glTF 2.0 scenes with embedded textures and animations.
- **FBX** (`.fbx`): Binary and ASCII FBX models with embedded/external textures (TGA/PNG/JPEG) and skeletal animations.
- **COLLADA** (`.dae`): Native client-side parser for COLLADA 1.4/1.5, unit scale normalization, DoubleSide materials to prevent SketchUp back-face holes, and animation support.
- **Procedural BIM Demo Model**: Built-in Modern Hillside Villa procedural template with active tropical solar illumination.

### 5. 🎯 Professional CAD & BIM Interaction
- **CAD-Standard Dual-Direction Box Selection**: Drag right for solid blue Window Selection (100% enclosed elements only); drag left for dashed green Crossing Selection (intersecting or enclosed elements); hold `Ctrl` to add/toggle, hold `Shift` to subtract.
- **Multi-Selection Inspector Card**: Batch visibility, isolation, framing (Zoom to), continuous batch opacity slider, and intersected Property Sets with "multiple" indicators.
- **True 3D Compass & Preset Views**: 26-orientation 3D orientation cube; viewport-centered elevation presets (Iso, Plan, N, S, E, W); standalone Ortho/Persp toggle with wireframe SVG icons; **50-step view history undo/redo** (`Ctrl+Z` / `Ctrl+Y`).
- **ACC Virtual Pivot Orbiting**: Smooth camera orbit anchored around the exact cursor hit surface point or element center.
- **Interactive Sectioning & Stencil Capping**: Section Plane and 6-sided Section Box with 5° angle snapping gizmos; WebGL Stencil Buffer real-time solid capping with 45° golden architectural hatching and dark perimeter contours.
- **Dynamic Solar Daylight Simulation**: Real-time astronomical solar azimuth and elevation angle calculations with interactive 24-hour daylight time slider.
- **Precision 3D Measurement**: Raycast snapping to 3D vertices and planar surfaces, reporting Euclidean distance and orthogonal $\Delta X, \Delta Y, \Delta Z$ offsets.
- **Universal 3D Animation Player Bar**: Floating capsule player for DAE, FBX, and GLTF with millisecond scrubbing, 0.5x-2.0x playback speeds, and multi-clip switching.
- **Stationary Collapsible Panels & Overflow Shadow**: Stationary collapsible sidebars with smooth animations; mouse-wheel horizontal scrolling category bar with adaptive gradient edge shadow.
- **Unified Multi-Format Subtitle & Metadata Sync**: Title bar subtitle dynamically synchronizes format version, authoring tool, units, and GIS coordinate reference with inspector profile.
- **Bilingual Zero-Reload Localization**: Instant seamless language switching between English and Simplified Chinese.

---

## 🚀 Quick Start

### 1. Direct Usage
Simply double-click `SWBIMScope.html` or `index.html` in any modern browser to run offline without setup.

### 2. Building from Source
Source code is located in `src/` and dependencies in `libs/`. Run Python build scripts to compile standalone distributions:

```bash
# Build default edition
python build_viewer.py

# Build all editions
python build_viewer.py --variant=all

# Sync and deploy Variant B
python sync_variant_b.py
```

---

## 📁 Project Structure

```
├── src/
│   ├── app.js               # Main application & CAD viewer logic
│   ├── clipping.js          # Section Box & clipping engine
│   ├── compare_engine.js    # Multi-version model diff engine
│   ├── demo_model.js        # Procedural BIM demo template
│   ├── ifc_parser.js        # Streaming IFC parser
│   ├── solar.js             # Solar astronomical engine
│   ├── i18n.js              # Chinese)
│   ├── styles.css           # Modern dark engineering stylesheet
│   ├── icon_red_b64.txt     # Embedded app icon
│   └── logo_ww_b64.txt      # Embedded brand logo
├── libs/
│   ├── three.min.js         # Core 3D engine
│   ├── OrbitControls.js     # Virtual pivot orbit controls
│   ├── GLTFLoader.js        # glTF loader
│   ├── FBXLoader.js         # FBX loader
│   ├── ColladaLoader.js     # Collada loader
│   ├── fflate.min.js        # Fast decompression
│   └── TGALoader.js         # TGA texture loader
├── build_viewer.py          # Single-file compiler & builder
├── sync_variant_b.py        # Variant B synchronizer
├── calc_time.py             # Development time calculator
├── variant_config.json      # Multi-variant config
├── SWBIMScope.html            # Standalone single-file distribution
├── index.html               # Mirror entrypoint & Pages root
├── CHANGELOG.md             # Release changelog & time metrics
├── FEATURES.md              # Features matrix & backlog pool
├── .gitignore               # Git ignore rules
└── README.md                # Project documentation
```

---

## 📄 License

This project is licensed under the MIT License.