/**
 * BIM Scope Point Cloud Management Engine (v2)
 * Powered by Potree 2.x Octree Streaming & potree-core
 * Supports both HTTP Range streaming from Las2Web and zero-server local file drag & drop.
 * @author WWBIM
 */

class LocalFileRequestManager {
  constructor(fileMap) {
    this.fileMap = fileMap;
  }

  async getUrl(url) {
    if (!url) return '/metadata.json';
    return url.startsWith('/') ? url : ('/' + url);
  }

  async fetch(input, init = {}) {
    const urlStr = typeof input === 'string' ? input : (input && input.url ? input.url : '');
    const cleanUrl = urlStr.split('?')[0];
    const fileName = cleanUrl.split(/[/\\]/).pop().toLowerCase();

    const file = this.fileMap.get(fileName);
    if (!file) {
      console.warn('[LocalFileRequestManager] File not found in local drop map:', fileName);
      return new Response(null, { status: 404, statusText: 'Not Found' });
    }

    if (fileName === 'metadata.json') {
      const text = await file.text();
      return new Response(text, {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Range request handling for chunk streaming of octree.bin and hierarchy.bin
    const headers = init.headers || {};
    let rangeHeader = null;
    if (typeof headers.get === 'function') {
      rangeHeader = headers.get('Range');
    } else if (typeof headers === 'object') {
      rangeHeader = headers['Range'] || headers['range'];
    }

    const totalSize = file.size;

    if (rangeHeader) {
      const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
      if (match) {
        const start = parseInt(match[1], 10);
        const end = match[2] ? parseInt(match[2], 10) : totalSize - 1;
        const sliceBlob = file.slice(start, end + 1);
        const buf = await sliceBlob.arrayBuffer();

        return new Response(buf, {
          status: 206,
          statusText: 'Partial Content',
          headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Range': `bytes ${start}-${end}/${totalSize}`,
            'Content-Length': String(buf.byteLength),
            'Accept-Ranges': 'bytes'
          }
        });
      }
    }

    const buf = await file.arrayBuffer();
    return new Response(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': String(totalSize),
        'Accept-Ranges': 'bytes'
      }
    });
  }
}

class BIMPointCloudManager {
  constructor(app) {
    this.app = app;
    this.potree = null;
    this.pointClouds = [];
    this.activePointCloud = null;
    this.isPointCloudSelected = false;

    // Visual & Rendering Configuration
    this.pointSize = 1.0;
    this.pointSizeType = 2; // 0: FIXED, 1: ATTENUATED, 2: ADAPTIVE
    this.pointBudget = 2000000;
    this.pointColorType = 0; // 0: RGB, 3: ELEVATION, 4: INTENSITY, 8: CLASSIFICATION
    this.opacity = 1.0;
    this.offset = new THREE.Vector3(0, 0, 0);

    // Snapping Picker
    this.picker = null;

    // Check URL parameters on initialization
    this.checkUrlParameters();
  }

  initPotree() {
    if (this.potree) return;
    if (typeof window.Potree === 'function') {
      this.potree = new window.Potree();
      this.potree.pointBudget = this.pointBudget;
      if (window.PotreeCore && window.PotreeCore.PointCloudOctreePicker) {
        this.picker = new window.PotreeCore.PointCloudOctreePicker();
      }
    } else {
      console.warn('Potree library not found. Ensure potree-core.min.js is loaded.');
    }
  }

  checkUrlParameters() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const pcUrl = urlParams.get('pointcloud') || urlParams.get('potree') || urlParams.get('las');
      if (pcUrl) {
        const decoded = decodeURIComponent(pcUrl);
        setTimeout(() => {
          this.loadFromUrl(decoded);
        }, 300);
      }
    } catch (e) {
      console.warn('Error reading pointcloud URL parameter:', e);
    }
  }

  async loadFromUrl(metadataUrl) {
    this.initPotree();
    if (!this.potree) {
      this.app.showToast('Potree library initialization failed', 3000);
      return null;
    }

    try {
      if (this.app.showToast) {
        this.app.showToast(window.I18N ? window.I18N.t('pointCloudLoading') : 'Streaming point cloud octree...', 2500);
      }

      // Parse metadata filename and baseUrl
      const lastSlash = metadataUrl.lastIndexOf('/');
      let baseUrl = '';
      let fileName = 'metadata.json';
      if (lastSlash >= 0) {
        baseUrl = metadataUrl.substring(0, lastSlash + 1);
        fileName = metadataUrl.substring(lastSlash + 1) || 'metadata.json';
      } else {
        baseUrl = './';
        fileName = metadataUrl;
      }

      console.log(`[BIMPointCloudManager] Loading point cloud: ${fileName} from ${baseUrl}`);
      const pco = await this.potree.loadPointCloud(fileName, baseUrl);

      if (!pco) {
        throw new Error('Null point cloud returned');
      }

      this.onPointCloudLoaded(pco);
      return pco;
    } catch (err) {
      console.error('[BIMPointCloudManager] Load error:', err);
      if (this.app.showToast) {
        const errMsg = window.I18N ? window.I18N.t('pointCloudLoadError', { error: err.message }) : `Failed to load point cloud: ${err.message}`;
        this.app.showToast(errMsg, 4000);
      }
      return null;
    }
  }

  async loadFromLocalFiles(fileList) {
    this.initPotree();
    if (!this.potree) {
      this.app.showToast('Potree library initialization failed', 3000);
      return null;
    }

    const fileMap = new Map();
    for (const f of fileList) {
      const baseName = (f.name || '').split(/[/\\]/).pop().toLowerCase();
      fileMap.set(baseName, f);
      if (f.webkitRelativePath) {
        const relBase = f.webkitRelativePath.split(/[/\\]/).pop().toLowerCase();
        fileMap.set(relBase, f);
      }
    }

    if (!fileMap.has('metadata.json')) {
      if (this.app.showToast) this.app.showToast('metadata.json not found in dropped files', 3000);
      return null;
    }

    // Check if octree.bin exists in the dropped files
    if (!fileMap.has('octree.bin')) {
      this.showMissingBinModal();
      return null;
    }

    try {
      if (this.app.showToast) {
        this.app.showToast(window.I18N ? window.I18N.t('pointCloudLoading') : 'Streaming point cloud octree...', 2500);
      }

      const reqManager = new LocalFileRequestManager(fileMap);
      const pco = await this.potree.loadPointCloud('/metadata.json', reqManager);

      if (!pco) throw new Error('Null point cloud returned');

      // Derive friendly name
      let pcName = 'Point Cloud';
      const folderFile = fileList.find(f => f.webkitRelativePath);
      if (folderFile) {
        const rootFolder = folderFile.webkitRelativePath.split(/[/\\]/)[0];
        if (rootFolder && rootFolder !== '.' && rootFolder !== '') pcName = rootFolder;
      } else if (fileList.length > 0) {
        const nonBin = fileList.find(f => {
          const name = (f.name || '').toLowerCase();
          return !name.endsWith('.bin') && 
                 !name.endsWith('.json') && 
                 !name.endsWith('.txt') && 
                 !name.endsWith('.log') && 
                 !name.startsWith('.');
        });
        if (nonBin) {
          pcName = nonBin.name.replace(/\.[^/.]+$/, '');
        }
      }
      if (pco.pcoGeometry && pco.pcoGeometry.loader && pco.pcoGeometry.loader.metadata && pco.pcoGeometry.loader.metadata.name) {
        pcName = pco.pcoGeometry.loader.metadata.name;
      }
      pco.name = pcName;

      this.onPointCloudLoaded(pco);
      return pco;
    } catch (err) {
      console.error('[BIMPointCloudManager] Local load error:', err);
      if (this.app.showToast) {
        const errMsg = window.I18N ? window.I18N.t('pointCloudLoadError', { error: err.message }) : `Failed to load point cloud: ${err.message}`;
        this.app.showToast(errMsg, 4000);
      }
      return null;
    }
  }

  onPointCloudLoaded(pco) {
    // Potree constructor in potree-core copies raw offset: pco.position.copy(pcoGeometry.offset);
    // In surveying (ASPRS LAS/LAZ): X = Easting, Y = Northing, Z = Elevation (Z-up).
    // In Three.js / BIM Scope (Y-up):
    // Three.js X = Easting
    // Three.js Y = Elevation (Z_las)
    // Three.js Z = -Northing (-Y_las)
    const rawOffset = (pco.pcoGeometry && pco.pcoGeometry.offset) ? pco.pcoGeometry.offset.clone() : pco.position.clone();
    pco.userData._rawOffset = rawOffset.clone();
    pco.position.set(rawOffset.x, rawOffset.z, -rawOffset.y);
    pco.rotation.x = -Math.PI / 2;
    pco.userData._isZUp = true;
    pco.isPointCloud = true;
    pco.userData.isPointCloud = true;
    pco.updateMatrixWorld(true);

    // Configure Point Cloud Material
    this.configureMaterial(pco);

    // Add to scene
    this.app.scene.add(pco);
    this.pointClouds.push(pco);
    this.activePointCloud = pco;
    this.isPointCloudSelected = true;

    // Link with existing clipping planes
    this.syncClippingWithApp();

    // Update Left Sidebar Model Hierarchy
    this.updateModelHierarchyTree();

    // Update Right Sidebar Inspector
    this.renderInspectorCard();

    // Fit View to point cloud
    this.fitPointCloudView(pco);

    const pointCount = this.getPointCloudPointCount(pco);
    const countStr = (pointCount || 0).toLocaleString();
    if (this.app.showToast) {
      const msg = window.I18N ? window.I18N.t('pointCloudLoaded', { count: countStr }) : `Point cloud loaded: ${countStr} points`;
      this.app.showToast(msg, 3500);
    }

    if (this.app._wakeRender) {
      this.app._wakeRender(3500);
    }
  }

  toggleOrientation(pco = this.activePointCloud) {
    if (!pco) return;
    const isZUp = Boolean(pco.userData._isZUp);
    pco.userData._isZUp = !isZUp;
    const rawOffset = pco.userData._rawOffset || (pco.pcoGeometry && pco.pcoGeometry.offset) || new THREE.Vector3();
    if (pco.userData._isZUp) {
      pco.position.set(rawOffset.x, rawOffset.z, -rawOffset.y);
      pco.rotation.x = -Math.PI / 2;
    } else {
      pco.position.set(rawOffset.x, rawOffset.y, rawOffset.z);
      pco.rotation.x = 0;
    }
    pco.updateMatrixWorld(true);
    pco.userData._percentileComputed = false;
    pco.userData._percentileElevationRange = null;
    this.applyMaterialSettings();
    this.fitPointCloudView(pco);
    this.renderInspectorCard();
    if (this.app._wakeRender) this.app._wakeRender(1000);
  }

  getPointCloudPointCount(pco = this.activePointCloud) {
    if (!pco) return 0;
    if (typeof pco.numPoints === 'number' && !isNaN(pco.numPoints)) return pco.numPoints;
    if (pco.pcoGeometry) {
      if (typeof pco.pcoGeometry.numPoints === 'number' && !isNaN(pco.pcoGeometry.numPoints)) return pco.pcoGeometry.numPoints;
      if (typeof pco.pcoGeometry.points === 'number' && !isNaN(pco.pcoGeometry.points)) return pco.pcoGeometry.points;
      if (pco.pcoGeometry.loader && pco.pcoGeometry.loader.metadata) {
        const meta = pco.pcoGeometry.loader.metadata;
        if (typeof meta.points === 'number') return meta.points;
        if (typeof meta.numPoints === 'number') return meta.numPoints;
      }
    }
    return 0;
  }

  computePercentileElevationRange(pco, lowerPct = 0.015, upperPct = 0.985) {
    if (!pco) return null;

    pco.updateMatrixWorld(true);

    // 1. Collect world Y coordinates from loaded nodes (root node contains a uniform spatial subsample)
    const yVals = [];
    const nodes = [];
    if (pco.root) {
      nodes.push(pco.root);
    } else if (pco.pcoGeometry && pco.pcoGeometry.root && pco.pcoGeometry.root.geometry) {
      nodes.push(pco.pcoGeometry.root);
    }
    if (Array.isArray(pco.visibleNodes) && pco.visibleNodes.length > 0) {
      for (const vn of pco.visibleNodes) {
        if (vn && !nodes.includes(vn)) {
          nodes.push(vn);
        }
      }
    }

    for (const node of nodes) {
      const geo = node.geometry || (node.geometryNode && node.geometryNode.geometry);
      if (!geo || !geo.attributes || !geo.attributes.position) continue;
      const pos = geo.attributes.position;
      const count = pos.count || (pos.array ? Math.floor(pos.array.length / 3) : 0);
      const arr = pos.array;
      if (!arr) continue;

      let m = null;
      const sceneNode = node.sceneNode || (pco.root && pco.root.sceneNode);
      if (sceneNode) {
        sceneNode.updateMatrixWorld(true);
        m = sceneNode.matrixWorld.elements;
      } else {
        m = pco.matrixWorld.elements;
      }

      // Stride to sample up to ~30,000 points in milliseconds
      const stride = count > 30000 ? Math.ceil(count / 30000) : 1;
      for (let i = 0; i < count; i += stride) {
        const x = arr[i * 3];
        const y = arr[i * 3 + 1];
        const z = arr[i * 3 + 2];
        const worldY = m[1] * x + m[5] * y + m[9] * z + m[13];
        if (Number.isFinite(worldY)) {
          yVals.push(worldY);
        }
      }
    }

    if (yVals.length >= 20) {
      yVals.sort((a, b) => a - b);
      const lowIdx = Math.floor(yVals.length * lowerPct);
      const highIdx = Math.min(yVals.length - 1, Math.floor(yVals.length * upperPct));
      let pLow = yVals[lowIdx];
      let pHigh = yVals[highIdx];
      if (pHigh <= pLow + 0.001) pHigh = pLow + 1.0;
      return [pLow, pHigh];
    }

    // 2. Fallback: world bounding box
    const worldBox = this.getWorldBoundingBox(pco);
    if (worldBox) {
      let minY = worldBox.min.y;
      let maxY = worldBox.max.y;
      if (maxY > minY) return [minY, maxY];
    }

    return [0, 100];
  }

  configureMaterial(pco) {
    if (!pco || !pco.material) return;
    const mat = pco.material;
    mat.size = this.pointSize;
    mat.pointSizeType = this.pointSizeType;
    mat.opacity = this.opacity;
    mat.transparent = this.opacity < 0.999;

    // Detect if RGB attribute exists
    const hasRgb = (
      (pco.pcoGeometry && pco.pcoGeometry.pointAttributes && pco.pcoGeometry.pointAttributes.attributes &&
       pco.pcoGeometry.pointAttributes.attributes.some(a => {
         const n = (a.name || '').toLowerCase();
         return n === 'rgb' || n === 'rgba' || n === 'color' || n === 'color_packed';
       })) ||
      (pco.pcoGeometry && pco.pcoGeometry.loader && pco.pcoGeometry.loader.metadata && pco.pcoGeometry.loader.metadata.attributes &&
       pco.pcoGeometry.loader.metadata.attributes.some(a => {
         const n = (a.name || '').toLowerCase();
         return n === 'rgb' || n === 'rgba' || n === 'color' || n === 'color_packed';
       }))
    );

    if (hasRgb) {
      mat.pointColorType = window.PotreeCore ? window.PotreeCore.PointColorType.RGB : 0;
      this.pointColorType = mat.pointColorType;
    } else {
      mat.pointColorType = window.PotreeCore ? window.PotreeCore.PointColorType.ELEVATION : 3;
      this.pointColorType = mat.pointColorType;
    }

    // Ensure RAINBOW visible spectrum gradient (Purple/Blue -> Cyan/Green/Yellow -> Orange/Red)
    if (window.PotreeCore && window.PotreeCore.RAINBOW) {
      mat.gradient = window.PotreeCore.RAINBOW;
    }

    // Set initial elevation range
    const elevRange = this.computePercentileElevationRange(pco);
    if (elevRange) {
      mat.elevationRange = elevRange;
      pco.userData._percentileElevationRange = elevRange;
    }

    // Set intensity range from metadata if available
    let intMin = 0;
    let intMax = 65535;
    if (pco.pcoGeometry && pco.pcoGeometry.loader && pco.pcoGeometry.loader.metadata) {
      const attrs = pco.pcoGeometry.loader.metadata.attributes || [];
      const intAttr = attrs.find(a => a.name === 'intensity');
      if (intAttr && Array.isArray(intAttr.max) && intAttr.max[0] > 0) {
        intMin = (intAttr.min && intAttr.min[0] !== undefined) ? intAttr.min[0] : 0;
        intMax = intAttr.max[0];
      }
    }
    mat.intensityRange = [intMin, intMax];
  }

  update(camera, renderer) {
    if (!this.potree || this.pointClouds.length === 0) return;
    try {
      const res = this.potree.updatePointClouds(this.pointClouds, camera, renderer);

      // Dynamically compute percentile elevation range as soon as node geometry is loaded
      for (const pco of this.pointClouds) {
        if (pco && !pco.userData._percentileComputed) {
          if (pco.pcoGeometry && pco.pcoGeometry.root && pco.pcoGeometry.root.loaded && pco.pcoGeometry.root.geometry) {
            const range = this.computePercentileElevationRange(pco);
            if (range) {
              pco.userData._percentileElevationRange = range;
              pco.userData._percentileComputed = true;
              if (pco.material) {
                pco.material.elevationRange = range;
              }
            }
          }
        }
      }

      const hasLoading = (res && res.nodeLoadPromises && res.nodeLoadPromises.length > 0) || (this.potree.numNodesLoading > 0);
      if (hasLoading) {
        if (this.app._wakeRender) this.app._wakeRender(600);
      }
    } catch (e) {
      // Catch any frame-rate worker synchronization glitches silently
    }
  }

  syncClippingWithApp() {
    if (!this.app || !this.app.clippingEngine) return;
    const clippingPlanes = this.app.clippingEngine.clippingPlanes || [];
    this.updateClipping(clippingPlanes);
  }

  updateClipping(planes) {
    const ClipMode = window.PotreeCore ? window.PotreeCore.ClipMode : { DISABLED: 0, CLIP_OUTSIDE: 1 };
    for (const pco of this.pointClouds) {
      if (pco && pco.material) {
        pco.material.clippingPlanes = planes || [];
        if (typeof pco.material.clipMode !== 'undefined') {
          pco.material.clipMode = (planes && planes.length > 0) ? ClipMode.CLIP_OUTSIDE : ClipMode.DISABLED;
        }
      }
    }
    if (this.app && this.app._wakeRender) {
      this.app._wakeRender();
    }
  }

  getWorldBoundingBox(pco = this.activePointCloud) {
    if (!pco) return null;
    pco.updateMatrixWorld(true);
    let box = null;
    if (pco.pcoGeometry && pco.pcoGeometry.boundingBox) {
      box = pco.pcoGeometry.boundingBox.clone();
    } else if (pco.boundingBox) {
      box = pco.boundingBox.clone();
    }
    if (!box) return null;
    box.applyMatrix4(pco.matrixWorld);
    return box;
  }

  fitPointCloudView(pco = this.activePointCloud, immediate = false) {
    if (!pco || !this.app || !this.app.camera) return;
    const box = this.getWorldBoundingBox(pco);
    if (!box) return;

    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z, 5.0);

    const fov = (this.app.camera.fov || 45) * (Math.PI / 180);
    const cameraDist = Math.max((maxDim / 2) / Math.tan(fov / 2) * 1.5, 10.0);

    const neededFar = Math.max(this.app.camera.far || 5000, cameraDist * 4 + maxDim * 2);
    if (this.app.camera.far < neededFar) {
      if (typeof this.app.setFarClip === 'function') {
        this.app.setFarClip(neededFar, true);
      } else {
        this.app.camera.far = neededFar;
        this.app.camera.updateProjectionMatrix();
      }
    }

    const offsetDir = new THREE.Vector3(1, 1, 0.8).normalize();
    const targetCam = center.clone().addScaledVector(offsetDir, cameraDist);

    if (this.app.pivotPoint) {
      this.app.pivotPoint.copy(center);
      if (typeof this.app.showPivotIndicator === 'function') {
        this.app.showPivotIndicator(center);
      }
    }

    if (this.app.controls && this.app.controls.target) {
      this.app.controls.target.copy(center);
    }

    if (immediate || !this.app.tweenCamera) {
      this.app.camera.position.copy(targetCam);
      this.app.camera.lookAt(center);
      if (this.app.controls) this.app.controls.update();
      if (this.app.compass3d) this.app.compass3d.update();
      if (!this.app.isNavigatingViewHistory && typeof this.app.pushViewSnapshot === 'function') {
        this.app.pushViewSnapshot();
      }
    } else {
      this.app.tweenCamera(targetCam, center);
    }

    this.isPointCloudSelected = true;
    if (this.app.syncTreeSelection) {
      this.app.syncTreeSelection();
    }
    this.renderInspectorCard();

    if (this.app._wakeRender) {
      this.app._wakeRender(1000);
    }
  }

  centerToOrigin(pco = this.activePointCloud) {
    if (!pco) return;
    const box = this.getWorldBoundingBox(pco);
    if (!box) return;

    const center = box.getCenter(new THREE.Vector3());
    if (!pco.userData._originalPosition) {
      pco.userData._originalPosition = pco.position.clone();
    }

    pco.position.sub(center);
    pco.updateMatrixWorld(true);
    pco.userData._percentileComputed = false;
    pco.userData._percentileElevationRange = null;
    this.applyMaterialSettings();

    this.fitPointCloudView(pco);
    this.renderInspectorCard();

    if (this.app.showToast) {
      const msg = window.I18N ? window.I18N.t('pointCloudCenteredToast') : 'Point cloud centered to [0, 0, 0]';
      this.app.showToast(msg, 3500);
    }
  }

  restoreOriginalCoordinates(pco = this.activePointCloud) {
    if (!pco || !pco.userData._originalPosition) return;
    pco.position.copy(pco.userData._originalPosition);
    pco.updateMatrixWorld(true);
    pco.userData._percentileComputed = false;
    pco.userData._percentileElevationRange = null;
    this.applyMaterialSettings();

    this.fitPointCloudView(pco);
    this.renderInspectorCard();

    if (this.app.showToast) {
      const msg = window.I18N ? window.I18N.t('pointCloudRestoredToast') : 'Original coordinates restored';
      this.app.showToast(msg, 3500);
    }
  }

  // --- SNAPPING & RAYCASTING ---
  raycast(raycaster, screenThreshold = 15) {
    if (!this.picker || this.pointClouds.length === 0 || !this.app.camera || !this.app.renderer) {
      return null;
    }

    try {
      const visiblePcos = this.pointClouds.filter(p => p.visible);
      if (visiblePcos.length === 0) return null;

      const hit = this.picker.pick(
        this.app.renderer,
        this.app.camera,
        raycaster.ray,
        visiblePcos,
        { pickWindowSize: screenThreshold, pickClipped: false }
      );

      if (hit && hit.position) {
        return {
          point: hit.position.clone(),
          normal: (hit.normal && hit.normal.isVector3) ? hit.normal.clone() : new THREE.Vector3(0, 1, 0),
          distance: this.app.camera.position.distanceTo(hit.position),
          pointCloud: hit.pointCloud || hit.pointcloud || (visiblePcos.length === 1 ? visiblePcos[0] : null),
          index: hit.pointIndex
        };
      }
    } catch (e) {
      // Fallback
    }
    return null;
  }

  // --- LEFT SIDEBAR MODEL HIERARCHY TREE ---
  updateModelHierarchyTree() {
    // Remove legacy DOM element if present
    const legacyEl = document.getElementById('tree-group-pointcloud');
    if (legacyEl) legacyEl.remove();

    // Rebuild or re-render unified VirtualBimTree
    if (this.app && this.app.buildHierarchyTree) {
      this.app.buildHierarchyTree();
    }
  }

  getColorModeLabel(pco = this.activePointCloud) {
    if (!pco || !pco.material) return 'RGB';
    const PointColorType = window.PotreeCore ? window.PotreeCore.PointColorType : { RGB: 0, COLOR: 1, DEPTH: 2, HEIGHT: 3, ELEVATION: 3, INTENSITY: 4, CLASSIFICATION: 5 };
    const pct = pco.material.pointColorType;
    if (pct === PointColorType.RGB || pct === 0) return 'RGB';
    if (pct === PointColorType.HEIGHT || pct === PointColorType.ELEVATION || pct === 3) return 'Elevation';
    if (pct === PointColorType.INTENSITY || pct === 4) return 'Intensity';
    if (pct === PointColorType.CLASSIFICATION || pct === 5) return 'Classification';
    return 'RGB';
  }

  toggleVisibility() {
    for (const pco of this.pointClouds) {
      pco.visible = !pco.visible;
    }
    if (this.app._wakeRender) this.app._wakeRender();
  }

  // --- RIGHT SIDEBAR INSPECTOR CARD ---
  renderInspectorCard() {
    const inspectorContainer = document.getElementById('inspector-content') || document.getElementById('sidebar-right');
    if (!inspectorContainer) return;

    let card = document.getElementById('pointcloud-inspector-card');
    if (!card) {
      card = document.createElement('div');
      card.id = 'pointcloud-inspector-card';
      card.className = 'inspector-card pointcloud-card';
      const firstSection = inspectorContainer.querySelector('.inspector-section') || inspectorContainer.firstChild;
      if (firstSection) {
        inspectorContainer.insertBefore(card, firstSection);
      } else {
        inspectorContainer.appendChild(card);
      }
    }

    const isZh = (window.I18N ? window.I18N.currentLang : 'zh') === 'zh';
    const numPoints = this.getPointCloudPointCount(this.activePointCloud);

    let centerStr = '-';
    let sizeStr = '-';
    if (this.activePointCloud) {
      const box = this.getWorldBoundingBox(this.activePointCloud);
      if (box) {
        const c = box.getCenter(new THREE.Vector3());
        const s = box.getSize(new THREE.Vector3());
        centerStr = `X: ${c.x.toFixed(1)}, Y: ${(-c.z).toFixed(1)}, RL: ${c.y.toFixed(1)}`;
        sizeStr = `ΔX: ${s.x.toFixed(1)}m, ΔY: ${s.z.toFixed(1)}m, ΔRL: ${s.y.toFixed(1)}m`;
      }
    }

    const hasOriginalPos = Boolean(this.activePointCloud && this.activePointCloud.userData && this.activePointCloud.userData._originalPosition);
    const isZUp = Boolean(this.activePointCloud && this.activePointCloud.userData && this.activePointCloud.userData._isZUp);
    const coordMapping = (this.activePointCloud && this.activePointCloud.userData && this.activePointCloud.userData.coordinateMapping) || 'auto';

    card.innerHTML = `
      <div class="inspector-card-header" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="font-size:15px;">☁️</span>
          <span style="font-weight:700; font-size:13px; color:var(--accent); text-transform:uppercase; letter-spacing:0.5px;">${isZh ? '点云属性与渲染控制' : 'Point Cloud Properties'}</span>
        </div>
        <span style="font-size:11px; color:var(--text-secondary); font-family:var(--font-mono);">${((numPoints || 0)).toLocaleString()} pts</span>
      </div>

      <!-- Quick Action Buttons: Zoom & Center to Origin -->
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px; margin-bottom:12px;">
        <button type="button" id="btn-pc-zoom-fit" style="padding:6px 8px; font-size:11.5px; font-weight:700; background:var(--accent); color:#000; border:none; border-radius:6px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:4px;">
          <span>🎯</span> ${isZh ? '聚焦定位点云' : 'Zoom to Points'}
        </button>
        <button type="button" id="btn-pc-center-origin" style="padding:6px 8px; font-size:11.5px; font-weight:600; background:rgba(56,189,248,0.12); color:var(--accent); border:1px solid rgba(56,189,248,0.35); border-radius:6px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:4px;">
          <span>${hasOriginalPos ? '↺' : '📍'}</span> ${hasOriginalPos ? (isZh ? '恢复原始坐标' : 'Restore Coords') : (isZh ? '移至原点居中' : 'Center to [0,0,0]')}
        </button>
      </div>

      <!-- Spatial Coordinate Readout Box -->
      <div style="background:rgba(0,0,0,0.25); border:1px solid var(--border-color); border-radius:6px; padding:8px 10px; margin-bottom:12px; font-size:11px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
          <span style="color:var(--text-muted);">${isZh ? '空间中心' : 'Center'}:</span>
          <span style="font-family:var(--font-mono); color:var(--text-primary); font-weight:600;">${centerStr}</span>
        </div>
        <div style="display:flex; justify-content:space-between;">
          <span style="color:var(--text-muted);">${isZh ? '包围盒跨度' : 'Extents'}:</span>
          <span style="font-family:var(--font-mono); color:var(--text-secondary);">${sizeStr}</span>
        </div>
      </div>

      <!-- Point Size Slider -->
      <div class="pc-control-row" style="margin-bottom:10px;">
        <div style="display:flex; justify-content:space-between; font-size:11.5px; margin-bottom:4px;">
          <span>${isZh ? '点尺寸 (Point Size)' : 'Point Size'}</span>
          <span id="pc-val-size" style="font-family:var(--font-mono); color:var(--accent); font-weight:700;">${this.pointSize.toFixed(1)} px</span>
        </div>
        <input type="range" id="pc-slider-size" min="0.2" max="4.0" step="0.1" value="${this.pointSize}" style="width:100%;">
      </div>

      <!-- Point Budget Slider -->
      <div class="pc-control-row" style="margin-bottom:10px;">
        <div style="display:flex; justify-content:space-between; font-size:11.5px; margin-bottom:4px;">
          <span>${isZh ? '点云预算 / 密度 (Budget)' : 'Point Budget'}</span>
          <span id="pc-val-budget" style="font-family:var(--font-mono); color:var(--accent); font-weight:700;">${(this.pointBudget / 1000000).toFixed(1)}M pts</span>
        </div>
        <input type="range" id="pc-slider-budget" min="500000" max="5000000" step="250000" value="${this.pointBudget}" style="width:100%;">
      </div>

      <!-- Color Mode Selector -->
      <div class="pc-control-row" style="margin-bottom:10px;">
        <div style="font-size:11.5px; margin-bottom:5px;">${isZh ? '着色模式 (Color Mode)' : 'Color Mode'}</div>
        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:6px;">
          <button type="button" class="pc-color-btn ${this.pointColorType === 0 ? 'active' : ''}" data-color="0" style="padding:4px 6px; font-size:11px; border-radius:4px; cursor:pointer;">
            ${isZh ? '🎨 真彩色' : 'RGB'}
          </button>
          <button type="button" class="pc-color-btn ${this.pointColorType === 3 ? 'active' : ''}" data-color="3" style="padding:4px 6px; font-size:11px; border-radius:4px; cursor:pointer;">
            ${isZh ? '🌈 高程' : 'Elevation'}
          </button>
          <button type="button" class="pc-color-btn ${this.pointColorType === 4 ? 'active' : ''}" data-color="4" style="padding:4px 6px; font-size:11px; border-radius:4px; cursor:pointer;">
            ${isZh ? '💡 强度' : 'Intensity'}
          </button>
        </div>
      </div>

      <!-- Opacity Slider -->
      <div class="pc-control-row" style="margin-bottom:12px;">
        <div style="display:flex; justify-content:space-between; font-size:11.5px; margin-bottom:4px;">
          <span>${isZh ? '点云不透明度 (Opacity)' : 'Opacity'}</span>
          <span id="pc-val-opacity" style="font-family:var(--font-mono); color:var(--accent); font-weight:700;">${Math.round(this.opacity * 100)}%</span>
        </div>
        <input type="range" id="pc-slider-opacity" min="0.1" max="1.0" step="0.05" value="${this.opacity}" style="width:100%;">
      </div>

      <!-- Orientation (Up Axis) -->
      <div class="pc-control-row" style="margin-bottom:12px;">
        <div style="font-size:11.5px; margin-bottom:5px;">${isZh ? '高程轴向 (Up Axis)' : 'Elevation Up Axis'}</div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px;">
          <button type="button" id="btn-pc-axis-z" class="pc-axis-btn ${isZUp ? 'active' : ''}" style="padding:4px 6px; font-size:11px; border-radius:4px; cursor:pointer;">
            ${isZh ? '🔼 Z-Up (测量标准)' : '🔼 Z-Up (Default)'}
          </button>
          <button type="button" id="btn-pc-axis-y" class="pc-axis-btn ${!isZUp ? 'active' : ''}" style="padding:4px 6px; font-size:11px; border-radius:4px; cursor:pointer;">
            ${isZh ? '🔄 Y-Up (原始直立)' : '🔄 Y-Up'}
          </button>
        </div>
      </div>

      <!-- Coordinate Mapping (大地测绘坐标映射) -->
      <div class="pc-control-row" style="margin-bottom:12px;">
        <div style="font-size:11.5px; margin-bottom:5px;">${isZh ? '坐标映射 (Coordinate Mapping)' : 'Coordinate Mapping'}</div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px;">
          <button type="button" id="btn-pc-map-auto" class="pc-map-btn ${(!coordMapping || coordMapping === 'auto') ? 'active' : ''}" style="padding:4px 6px; font-size:11px; border-radius:4px; cursor:pointer;">
            ${isZh ? '✨ 智能大地映射' : '✨ Auto Geodetic'}
          </button>
          <button type="button" id="btn-pc-map-swap" class="pc-map-btn ${coordMapping === 'swap_yz' ? 'active' : ''}" style="padding:4px 6px; font-size:11px; border-radius:4px; cursor:pointer;">
            ${isZh ? '🔀 互换 Y ⇄ Z' : '🔀 Swap Y ⇄ Z'}
          </button>
        </div>
      </div>
    `;

    // Hook events
    const sliderSize = card.querySelector('#pc-slider-size');
    const valSize = card.querySelector('#pc-val-size');
    if (sliderSize) {
      sliderSize.addEventListener('input', (e) => {
        this.pointSize = parseFloat(e.target.value);
        if (valSize) valSize.textContent = `${this.pointSize.toFixed(1)} px`;
        this.applyMaterialSettings();
      });
    }

    const sliderBudget = card.querySelector('#pc-slider-budget');
    const valBudget = card.querySelector('#pc-val-budget');
    if (sliderBudget) {
      sliderBudget.addEventListener('input', (e) => {
        this.pointBudget = parseInt(e.target.value, 10);
        if (this.potree) this.potree.pointBudget = this.pointBudget;
        if (valBudget) valBudget.textContent = `${(this.pointBudget / 1000000).toFixed(1)}M pts`;
        if (this.app._wakeRender) this.app._wakeRender();
      });
    }

    const colorBtns = card.querySelectorAll('.pc-color-btn');
    colorBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        colorBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.pointColorType = parseInt(btn.getAttribute('data-color'), 10);
        this.applyMaterialSettings();
      });
    });

    const sliderOpacity = card.querySelector('#pc-slider-opacity');
    const valOpacity = card.querySelector('#pc-val-opacity');
    if (sliderOpacity) {
      sliderOpacity.addEventListener('input', (e) => {
        this.opacity = parseFloat(e.target.value);
        if (valOpacity) valOpacity.textContent = `${Math.round(this.opacity * 100)}%`;
        this.applyMaterialSettings();
      });
    }

    const btnZoomFit = card.querySelector('#btn-pc-zoom-fit');
    if (btnZoomFit) {
      btnZoomFit.addEventListener('click', () => this.fitPointCloudView());
    }

    const btnCenter = card.querySelector('#btn-pc-center-origin');
    if (btnCenter) {
      btnCenter.addEventListener('click', () => {
        if (hasOriginalPos) {
          this.restoreOriginalCoordinates();
        } else {
          this.centerToOrigin();
        }
      });
    }

    const btnAxisZ = card.querySelector('#btn-pc-axis-z');
    const btnAxisY = card.querySelector('#btn-pc-axis-y');
    if (btnAxisZ && btnAxisY && this.activePointCloud) {
      btnAxisZ.addEventListener('click', () => {
        if (!this.activePointCloud.userData._isZUp) {
          this.toggleOrientation(this.activePointCloud);
        }
      });
      btnAxisY.addEventListener('click', () => {
        if (this.activePointCloud.userData._isZUp) {
          this.toggleOrientation(this.activePointCloud);
        }
      });
    }

    const btnMapAuto = card.querySelector('#btn-pc-map-auto');
    const btnMapSwap = card.querySelector('#btn-pc-map-swap');
    if (btnMapAuto && btnMapSwap && this.activePointCloud) {
      btnMapAuto.addEventListener('click', () => {
        this.activePointCloud.userData.coordinateMapping = 'auto';
        this.renderInspectorCard();
        if (this.app.renderMeasurementResults) this.app.renderMeasurementResults();
        if (this.app.updateMeasureMarkersAndCallouts) this.app.updateMeasureMarkersAndCallouts();
        if (this.app._wakeRender) this.app._wakeRender(200);
      });
      btnMapSwap.addEventListener('click', () => {
        const cur = this.activePointCloud.userData.coordinateMapping;
        this.activePointCloud.userData.coordinateMapping = (cur === 'swap_yz') ? 'asprs' : 'swap_yz';
        this.renderInspectorCard();
        if (this.app.renderMeasurementResults) this.app.renderMeasurementResults();
        if (this.app.updateMeasureMarkersAndCallouts) this.app.updateMeasureMarkersAndCallouts();
        if (this.app._wakeRender) this.app._wakeRender(200);
      });
    }
  }

  applyMaterialSettings() {
    for (const pco of this.pointClouds) {
      if (pco.material) {
        pco.material.size = this.pointSize;
        pco.material.pointColorType = this.pointColorType;

        // Ensure RAINBOW visible spectrum gradient
        if (window.PotreeCore && window.PotreeCore.RAINBOW) {
          pco.material.gradient = window.PotreeCore.RAINBOW;
        }

        // Apply 1.5% - 98.5% percentile elevation range
        let elevRange = pco.userData._percentileElevationRange;
        if (!elevRange || !pco.userData._percentileComputed) {
          elevRange = this.computePercentileElevationRange(pco);
          if (elevRange) {
            pco.userData._percentileElevationRange = elevRange;
            if (pco.pcoGeometry && pco.pcoGeometry.root && pco.pcoGeometry.root.geometry) {
              pco.userData._percentileComputed = true;
            }
          }
        }
        if (elevRange) {
          pco.material.elevationRange = elevRange;
        }

        let intMin = 0;
        let intMax = 65535;
        if (pco.pcoGeometry && pco.pcoGeometry.loader && pco.pcoGeometry.loader.metadata) {
          const attrs = pco.pcoGeometry.loader.metadata.attributes || [];
          const intAttr = attrs.find(a => a.name === 'intensity');
          if (intAttr && Array.isArray(intAttr.max) && intAttr.max[0] > 0) {
            intMin = (intAttr.min && intAttr.min[0] !== undefined) ? intAttr.min[0] : 0;
            intMax = intAttr.max[0];
          }
        }
        pco.material.intensityRange = [intMin, intMax];

        pco.material.opacity = this.opacity;
        pco.material.transparent = this.opacity < 0.999;
      }
    }
    if (this.app._wakeRender) {
      this.app._wakeRender(300);
    }
  }

  // --- MISSING OCTREE.BIN GUIDANCE MODAL ---
  showMissingBinModal() {
    let modal = document.getElementById('missing-bin-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'missing-bin-modal';
      modal.className = 'las-converter-modal-overlay';
      document.body.appendChild(modal);
    }

    const isZh = (window.I18N ? window.I18N.currentLang : 'zh') === 'zh';

    modal.innerHTML = `
      <div class="las-modal-card">
        <div class="las-modal-header">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:24px;">⚠️</span>
            <div>
              <div class="las-modal-title">${isZh ? '缺少点云二进制数据 (Missing octree.bin)' : 'Missing Point Cloud Data (octree.bin)'}</div>
              <div class="las-modal-subtitle">${isZh ? '仅检测到元数据描述文件 metadata.json' : 'Only metadata.json descriptor was dropped'}</div>
            </div>
          </div>
          <button type="button" class="las-modal-close" id="btn-close-missing-bin">✕</button>
        </div>

        <div class="las-modal-body">
          <div style="background:rgba(234,179,8,0.12); border:1px solid rgba(234,179,8,0.35); border-radius:8px; padding:12px; margin-bottom:14px; font-size:12.5px; line-height:1.6; color:var(--text-primary);">
            ${isZh
              ? '您刚才仅拖入了 <strong>metadata.json</strong> 配置文件。<br>受现代浏览器<strong>安全沙箱隔离限制</strong>，网页端无法自动读取您磁盘同目录下的 <code>octree.bin</code> 与 <code>hierarchy.bin</code> 实体数据，因此无法呈现三维点。'
              : 'You only dropped <strong>metadata.json</strong>.<br>Due to browser security sandbox restrictions, a web page cannot automatically read sibling binary files (<code>octree.bin</code> and <code>hierarchy.bin</code>) from your local drive.'}
          </div>

          <div style="font-size:13px; font-weight:700; margin-bottom:8px; color:var(--accent);">
            💡 ${isZh ? '请采用以下任意一种方式查看：' : 'Please use any of the following methods to view:'}
          </div>

          <div class="las-steps-container">
            <div class="las-step-item">
              <div class="las-step-num">1</div>
              <div class="las-step-content">
                <div class="las-step-title">${isZh ? '拖入整个输出文件夹 (推荐)' : 'Drop the entire folder (Recommended)'}</div>
                <div class="las-step-desc">${isZh ? '直接将 Las2Web 转换生成的整个文件夹拖入本视口，系统将自动递归读取所有分块。' : 'Drag the entire Potree folder directly into BIM Scope to load all chunks automatically.'}</div>
              </div>
            </div>

            <div class="las-step-item">
              <div class="las-step-num">2</div>
              <div class="las-step-content">
                <div class="las-step-title">${isZh ? '多选文件同时拖入' : 'Select all files and drop together'}</div>
                <div class="las-step-desc">${isZh ? '在文件夹内按 <code>Ctrl+A</code> 全选 <code>metadata.json</code>、<code>octree.bin</code>、<code>hierarchy.bin</code>，一同拖入。' : 'Select metadata.json, octree.bin, and hierarchy.bin together and drop them.'}</div>
              </div>
            </div>

            <div class="las-step-item">
              <div class="las-step-num">3</div>
              <div class="las-step-content">
                <div class="las-step-title">${isZh ? '通过 Las2Web 本地服务自动打开' : 'Auto-view via Las2Web local server'}</div>
                <div class="las-step-desc">${isZh ? '在 Las2Web 转换完成后直接点击「查看点云」，自动通过本地 HTTP 流式秒开。' : 'Click "View Point Cloud" in Las2Web to stream smoothly from local HTTP server.'}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="las-modal-footer">
          <button type="button" class="las-btn-download" id="btn-dismiss-missing-bin" style="width:100%; text-align:center; cursor:pointer;">
            ✓ ${isZh ? '我知道了，我来拖入整个文件夹' : 'Got it, I will drop the folder'}
          </button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
    void modal.offsetWidth;
    modal.classList.add('visible');

    const closeBtn = modal.querySelector('#btn-close-missing-bin');
    const dismissBtn = modal.querySelector('#btn-dismiss-missing-bin');
    const hide = () => {
      modal.classList.remove('visible');
      setTimeout(() => { modal.style.display = 'none'; }, 300);
    };

    if (closeBtn) closeBtn.onclick = hide;
    if (dismissBtn) dismissBtn.onclick = hide;
    modal.onclick = (e) => {
      if (e.target === modal) hide();
    };
  }

  // --- LAS/LAZ PREPROCESSING GUIDANCE MODAL ---
  showLasConverterModal(fileName = '') {
    let modal = document.getElementById('las-converter-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'las-converter-modal';
      modal.className = 'las-converter-modal-overlay';
      document.body.appendChild(modal);
    }

    const isZh = (window.I18N ? window.I18N.currentLang : 'zh') === 'zh';
    const releaseUrl = 'https://github.com/wwbim/Las2Web/releases/latest';

    modal.innerHTML = `
      <div class="las-modal-card">
        <div class="las-modal-header">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:24px;">☁️</span>
            <div>
              <div class="las-modal-title">${isZh ? '点云预处理向导 (Las2Web)' : 'Point Cloud Preprocessing Guide'}</div>
              <div class="las-modal-subtitle">${isZh ? '检测到原始 LAS / LAZ 激光点云文件' : 'Raw LAS / LAZ LiDAR point cloud detected'}</div>
            </div>
          </div>
          <button type="button" class="las-modal-close" id="btn-close-las-modal">✕</button>
        </div>

        <div class="las-modal-body">
          <div class="las-file-badge">
            <span style="color:var(--accent); font-weight:700;">📄 ${fileName || (isZh ? '原始点云文件' : 'Raw Point Cloud File')}</span>
            <span style="font-size:11px; opacity:0.75;">(.las / .laz)</span>
          </div>

          <div class="las-reason-box">
            <div class="las-reason-title">💡 ${isZh ? '为什么需要预处理？' : 'Why is Octree Tiling Required?'}</div>
            <div class="las-reason-desc">
              ${isZh
                ? '原始 .las/.laz 文件由海量无序散点构成（通常达数亿点），直接在浏览器中计算容易导致内存耗尽卡死。使用配套转换器 <b>Las2Web</b> 预处理为八叉树（Potree 2.x Octree），即可实现千万级点云 <b>60 FPS 流式秒级载入与平滑缩放</b>。'
                : 'Raw .las/.laz files contain millions of unindexed 3D points. Web browsers cannot directly process multi-gigabyte binary point clouds efficiently. Converting with <b>Las2Web</b> to Potree 2.x Octree format unlocks <b>60 FPS streaming and smooth LOD navigation</b>.'}
            </div>
          </div>

          <!-- 3-Step Illustrated Workflow -->
          <div class="las-steps-container">
            <div class="las-step-item">
              <div class="las-step-num">1</div>
              <div class="las-step-content">
                <div class="las-step-title">${isZh ? '下载并打开 Las2Web' : 'Download Las2Web'}</div>
                <div class="las-step-desc">${isZh ? '绿色便携版，无需 Python 或环境依赖，解压直接双击运行。' : 'Portable release, zero dependencies, runs instantly on Windows.'}</div>
              </div>
            </div>

            <div class="las-step-item">
              <div class="las-step-num">2</div>
              <div class="las-step-content">
                <div class="las-step-title">${isZh ? '拖入点云，即拖即转' : 'Drag & Drop to Convert'}</div>
                <div class="las-step-desc">${isZh ? '将 .las/.laz 直接拖入 Las2Web 窗口，全自动在同级目录生成切片文件夹。' : 'Drop your scan into Las2Web. It converts automatically in-place.'}</div>
              </div>
            </div>

            <div class="las-step-item">
              <div class="las-step-num">3</div>
              <div class="las-step-content">
                <div class="las-step-title">${isZh ? '一键唤起 BIM Scope 查看' : 'Auto-View in BIM Scope'}</div>
                <div class="las-step-desc">${isZh ? '转换完成后自动拉起本视口流畅查看，支持与 BIM 模型合模对比与测量。' : 'Auto-launches into this BIM Scope viewer for 3D inspection & measurement.'}</div>
              </div>
            </div>
          </div>

          <div class="las-tip-hint">
            💡 ${isZh ? '如果您已经转换过，请直接将生成的 <code><文件名>_potree</code> 文件夹拖入本视口即可直接加载！' : 'Tip: If you have already converted it, drag the <code><name>_potree</code> folder directly into BIM Scope!'}
          </div>
        </div>

        <div class="las-modal-footer">
          <a href="${releaseUrl}" target="_blank" rel="noopener noreferrer" class="las-btn-download" id="btn-download-las2web">
            ⬇️ ${isZh ? '从 GitHub 下载 Las2Web 便携版' : 'Download Las2Web (GitHub Release)'}
          </a>
          <button type="button" class="las-btn-dismiss" id="btn-dismiss-las-modal">
            ${isZh ? '我知道了 / 关闭' : 'Got it / Close'}
          </button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
    void modal.offsetWidth;
    modal.classList.add('visible');

    const closeBtn = modal.querySelector('#btn-close-las-modal');
    const dismissBtn = modal.querySelector('#btn-dismiss-las-modal');
    const hide = () => {
      modal.classList.remove('visible');
      setTimeout(() => { modal.style.display = 'none'; }, 300);
    };

    if (closeBtn) closeBtn.onclick = hide;
    if (dismissBtn) dismissBtn.onclick = hide;
    modal.onclick = (e) => {
      if (e.target === modal) hide();
    };
  }
}

window.BIMPointCloudManager = BIMPointCloudManager;
