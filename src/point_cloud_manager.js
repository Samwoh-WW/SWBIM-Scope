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
    return url;
  }

  async fetch(input, init = {}) {
    const urlStr = typeof input === 'string' ? input : (input && input.url ? input.url : '');
    const cleanUrl = urlStr.split('?')[0];
    const fileName = cleanUrl.split('/').pop().toLowerCase();

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
      fileMap.set(f.name.toLowerCase(), f);
    }

    if (!fileMap.has('metadata.json')) {
      if (this.app.showToast) this.app.showToast('metadata.json not found in dropped files', 3000);
      return null;
    }

    try {
      if (this.app.showToast) {
        this.app.showToast(window.I18N ? window.I18N.t('pointCloudLoading') : 'Streaming point cloud octree...', 2500);
      }

      const reqManager = new LocalFileRequestManager(fileMap);
      const pco = await this.potree.loadPointCloud('metadata.json', reqManager);

      if (!pco) throw new Error('Null point cloud returned');

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
    // Configure Point Cloud Material
    this.configureMaterial(pco);

    // Add to scene
    this.app.scene.add(pco);
    this.pointClouds.push(pco);
    this.activePointCloud = pco;

    // Link with existing clipping planes
    this.syncClippingWithApp();

    // Update Left Sidebar Model Hierarchy
    this.updateModelHierarchyTree();

    // Update Right Sidebar Inspector
    this.renderInspectorCard();

    // Fit View if no other models loaded, or frame with scene
    if (!this.app.objects || this.app.objects.length === 0) {
      this.fitPointCloudView(pco);
    }

    const pointCount = this.getPointCloudPointCount(pco);
    const countStr = (pointCount || 0).toLocaleString();
    if (this.app.showToast) {
      const msg = window.I18N ? window.I18N.t('pointCloudLoaded', { count: countStr }) : `Point cloud loaded: ${countStr} points`;
      this.app.showToast(msg, 3500);
    }

    if (this.app._wakeRender) {
      this.app._wakeRender();
    }
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

  configureMaterial(pco) {
    if (!pco || !pco.material) return;
    const mat = pco.material;
    mat.size = this.pointSize;
    mat.pointSizeType = this.pointSizeType;
    mat.opacity = this.opacity;
    mat.transparent = this.opacity < 0.999;

    // Detect if RGB attribute exists
    const hasRgb = pco.pcoGeometry && pco.pcoGeometry.pointAttributes && (
      pco.pcoGeometry.pointAttributes.attributes.some(a => a.name === 'rgb' || a.name === 'COLOR_PACKED')
    );

    if (hasRgb) {
      mat.pointColorType = window.PotreeCore ? window.PotreeCore.PointColorType.RGB : 0;
      this.pointColorType = mat.pointColorType;
    } else {
      mat.pointColorType = window.PotreeCore ? window.PotreeCore.PointColorType.ELEVATION : 3;
      this.pointColorType = mat.pointColorType;
    }

    // Set elevation range for gradient mapping
    if (pco.boundingBox) {
      mat.elevationRange = [pco.boundingBox.min.z, pco.boundingBox.max.z];
    }
  }

  update(camera, renderer) {
    if (!this.potree || this.pointClouds.length === 0) return;
    try {
      this.potree.updatePointClouds(this.pointClouds, camera, renderer);
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

  fitPointCloudView(pco = this.activePointCloud) {
    if (!pco || !this.app || !this.app.camera) return;
    const srcBox = (pco.pcoGeometry && pco.pcoGeometry.boundingBox) ? pco.pcoGeometry.boundingBox : pco.boundingBox;
    if (!srcBox) return;
    const box = srcBox.clone();
    box.applyMatrix4(pco.matrixWorld);

    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z, 5.0);

    const fov = (this.app.camera.fov || 60) * (Math.PI / 180);
    const cameraDist = (maxDim / 2) / Math.tan(fov / 2) * 1.5;

    const offsetDir = new THREE.Vector3(1, 1, 0.8).normalize();
    this.app.camera.position.copy(center).addScaledVector(offsetDir, cameraDist);

    if (this.app.controls && this.app.controls.target) {
      this.app.controls.target.copy(center);
      this.app.controls.update();
    }
    this.app.camera.lookAt(center);

    if (this.app.compass3d) this.app.compass3d.update();
    if (this.app._wakeRender) this.app._wakeRender();
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
          distance: this.app.camera.position.distanceTo(hit.position),
          pointCloud: hit.pointcloud,
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
    const treeContainer = document.getElementById('model-tree') || document.getElementById('structures-tree');
    if (!treeContainer) return;

    let pcTreeGroup = document.getElementById('tree-group-pointcloud');
    if (!pcTreeGroup) {
      pcTreeGroup = document.createElement('div');
      pcTreeGroup.id = 'tree-group-pointcloud';
      pcTreeGroup.className = 'tree-node-group pointcloud-group';
      treeContainer.prepend(pcTreeGroup); // Place at top of hierarchy for fast access
    }

    const isZh = (window.I18N ? window.I18N.currentLang : 'zh') === 'zh';
    const totalPoints = this.pointClouds.reduce((sum, p) => sum + this.getPointCloudPointCount(p), 0);

    pcTreeGroup.innerHTML = `
      <div class="tree-node-row" style="display:flex; align-items:center; justify-content:space-between; padding:6px 8px; background:rgba(56,189,248,0.08); border-radius:6px; margin-bottom:6px; border:1px solid rgba(56,189,248,0.25);">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:15px;">☁️</span>
          <span style="font-size:12.5px; font-weight:700; color:var(--accent);">${isZh ? '点云图层 (Point Cloud)' : 'Point Cloud Layer'}</span>
          <span style="font-size:11px; color:var(--text-secondary); font-family:var(--font-mono);">(${((totalPoints || 0)).toLocaleString()} pts)</span>
        </div>
        <div style="display:flex; align-items:center; gap:10px;">
          <button type="button" class="pc-tree-vis-btn" id="btn-pc-toggle-vis" title="Toggle Visibility" style="background:none; border:none; color:var(--accent); cursor:pointer; font-size:14px; padding:2px;">
            ${this.activePointCloud && this.activePointCloud.visible ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
      </div>
    `;

    const visBtn = pcTreeGroup.querySelector('#btn-pc-toggle-vis');
    if (visBtn) {
      visBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleVisibility();
        visBtn.textContent = this.activePointCloud && this.activePointCloud.visible ? '👁️' : '👁️‍🗨️';
      });
    }
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

    card.innerHTML = `
      <div class="inspector-card-header" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="font-size:15px;">☁️</span>
          <span style="font-weight:700; font-size:13px; color:var(--accent); text-transform:uppercase; letter-spacing:0.5px;">${isZh ? '点云属性与渲染控制' : 'Point Cloud Properties'}</span>
        </div>
        <span style="font-size:11px; color:var(--text-secondary); font-family:var(--font-mono);">${((numPoints || 0)).toLocaleString()} pts</span>
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

      <!-- Actions -->
      <div style="display:flex; gap:8px;">
        <button type="button" id="btn-pc-fit-view" style="flex:1; padding:6px; font-size:11.5px; font-weight:700; background:var(--accent); color:#fff; border:none; border-radius:6px; cursor:pointer;">
          🎯 ${isZh ? '聚焦居中' : 'Fit View'}
        </button>
        <button type="button" id="btn-pc-reset-pos" style="flex:1; padding:6px; font-size:11.5px; background:var(--bg-hover); color:var(--text-primary); border:1px solid var(--border-color); border-radius:6px; cursor:pointer;">
          🔄 ${isZh ? '重置位置' : 'Reset Pos'}
        </button>
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

    const btnFit = card.querySelector('#btn-pc-fit-view');
    if (btnFit) {
      btnFit.addEventListener('click', () => this.fitPointCloudView());
    }

    const btnReset = card.querySelector('#btn-pc-reset-pos');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (this.activePointCloud) {
          this.activePointCloud.position.set(0, 0, 0);
          this.activePointCloud.updateMatrixWorld();
          if (this.app._wakeRender) this.app._wakeRender();
        }
      });
    }
  }

  applyMaterialSettings() {
    for (const pco of this.pointClouds) {
      if (pco.material) {
        pco.material.size = this.pointSize;
        pco.material.pointColorType = this.pointColorType;
        pco.material.opacity = this.opacity;
        pco.material.transparent = this.opacity < 0.999;
      }
    }
    if (this.app._wakeRender) {
      this.app._wakeRender();
    }
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
