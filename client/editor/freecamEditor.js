// client/editor/freecamEditor.js — Live Editor for FreeCam mode
// Shows raw source code, persists changes to disk, supports delete+comment

import * as THREE from 'three';

// ── Module state ────────────────────────────────────────────
let scene, camera, domElement;
let freecamActive = false;
let raycaster, mouseNDC;
let currentHovered = null;
let currentInstanceId = -1;
let highlightGroup = null;
let modalEl = null;
let selectedObject = null;
let selectedInstanceId = -1;
let selectedSourceFile = null;
let aiPollTimer = null;
let originalContent = '';
const MAX_SELECT_DISTANCE = 50;

// ── Public API ──────────────────────────────────────────────

export function initFreecamEditor(scn, cam, domEl) {
  scene = scn;
  camera = cam;
  domElement = domEl;
  raycaster = new THREE.Raycaster();
  mouseNDC = new THREE.Vector2(0, 0);
  raycaster.far = MAX_SELECT_DISTANCE;

  _buildModalDOM();
  console.log('[FreeCamEditor] Initialised — source-code editing ready');
}

export function setFreecamActive(active) {
  freecamActive = active;
  if (!active) {
    _clearHighlight();
    currentHovered = null;
    currentInstanceId = -1;
    _closeModal();
  }
}

export function isEditorModalOpen() {
  return modalEl && modalEl.backdrop.classList.contains('open');
}

export async function applyDeletions() {
  try {
    const res = await fetch('/api/deletions');
    if (!res.ok) return;
    const deletions = await res.json();
    if (!deletions.length) return;

    let applied = 0;
    const used = new Set();

    for (const del of deletions) {
      if (del.isInstancedMesh && del.instanceId >= 0) {
        // Match InstancedMesh by type name + position
        scene.traverse((obj) => {
          if (!obj.isInstancedMesh) return;
          if (used.has(obj.uuid + '_' + del.instanceId)) return;
          const typeName = _meshTypeName(obj);
          if (typeName !== del.meshType || del.instanceId >= obj.count) return;

          const matrix = new THREE.Matrix4();
          obj.getMatrixAt(del.instanceId, matrix);
          const pos = new THREE.Vector3();
          pos.setFromMatrixPosition(matrix);
          if (Math.abs(pos.x - del.position.x) < 1 && Math.abs(pos.z - del.position.z) < 1) {
            const zeroMatrix = new THREE.Matrix4().makeScale(0, 0, 0);
            obj.setMatrixAt(del.instanceId, zeroMatrix);
            obj.instanceMatrix.needsUpdate = true;
            used.add(obj.uuid + '_' + del.instanceId);
            applied++;
          }
        });
      } else if (del.position && del.meshType) {
        // Non-InstancedMesh: match by world position proximity + geometry type
        let bestMatch = null;
        let bestDist = Infinity;

        scene.traverse((obj) => {
          if (!obj.isMesh || obj.isInstancedMesh) return;
          if (!obj.geometry || obj.geometry.type !== del.meshType) return;
          if (obj.userData && obj.userData._editorDeleted) return;
          if (used.has(obj.uuid)) return;

          const worldPos = new THREE.Vector3();
          obj.getWorldPosition(worldPos);
          const dx = worldPos.x - del.position.x;
          const dy = worldPos.y - del.position.y;
          const dz = worldPos.z - del.position.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < 0.5 && dist < bestDist) {
            bestDist = dist;
            bestMatch = obj;
          }
        });

        if (bestMatch) {
          bestMatch.visible = false;
          bestMatch.userData._editorDeleted = true;
          bestMatch.traverse((c) => { if (c.isMesh) c.visible = false; });
          used.add(bestMatch.uuid);
          applied++;
        }
      }
    }

    if (applied > 0) {
      console.log('[FreeCamEditor] Re-applied', applied, 'deletions from registry');
    }
  } catch (err) {
    console.warn('[FreeCamEditor] Failed to apply deletions:', err);
  }
}

export function updateFreecamEditor() {
  if (!freecamActive || isEditorModalOpen()) return;

  raycaster.setFromCamera(mouseNDC, camera);
  const targets = _collectAllTargets();
  const hits = raycaster.intersectObjects(targets, false);

  if (hits.length > 0 && hits[0].distance < MAX_SELECT_DISTANCE) {
    const hit = hits[0];
    const obj = hit.object;
    const instanceId = hit.instanceId !== undefined ? hit.instanceId : -1;

    if (obj !== currentHovered || instanceId !== currentInstanceId) {
      _clearHighlight();
      currentHovered = obj;
      currentInstanceId = instanceId;
      _createHighlight(obj, instanceId);
    }
  } else {
    _clearHighlight();
    currentHovered = null;
    currentInstanceId = -1;
  }
}

export function onFreecamClick() {
  if (!freecamActive || isEditorModalOpen()) return;
  if (currentHovered) {
    selectedObject = currentHovered;
    selectedInstanceId = currentInstanceId;
    selectedSourceFile = _determineSourceFile(currentHovered);
    _openModal(currentHovered, currentInstanceId, selectedSourceFile);
  }
}

// ── Internal: Raycaster targets ─────────────────────────────

function _collectAllTargets() {
  const targets = [];
  scene.traverse((obj) => {
    if (obj.isMesh && obj.visible !== false && !obj.userData._editorDeleted) {
      targets.push(obj);
    }
  });
  return targets;
}

// ── Internal: Source file detection ─────────────────────────

function _determineSourceFile(obj) {
  if (obj.userData && obj.userData.sourceFile) return obj.userData.sourceFile;

  if (obj.isInstancedMesh) return 'client/zones/world.js';

  const KNOWN_TYPES = ['vehicle', 'character', 'building', 'tree', 'streetLight', 'trafficLight', 'pickup', 'police'];

  let cur = obj;
  while (cur) {
    if (cur.userData && cur.userData.sourceFile) return cur.userData.sourceFile;
    if (cur.name && cur.name.toLowerCase().includes('hospital')) return 'assets/complexes/hospital/index.js';

    // Check userData.type on every ancestor
    if (cur.userData && cur.userData.type) {
      if (cur.userData.type === 'police') return 'assets/complexes/police/index.js';
      if (KNOWN_TYPES.includes(cur.userData.type)) return 'assets/';
    }

    // Check parent name for clues about source
    if (cur.name) {
      const n = cur.name.toLowerCase();
      if (n.includes('hospital')) return 'assets/complexes/hospital/index.js';
      if (n.includes('police')) return 'assets/complexes/police/index.js';
      if (n.includes('building') || n.includes('tree') || n.includes('vehicle') || n.includes('character')) return 'assets/';
    }

    cur = cur.parent;
  }

  return null;
}

function _objectLabel(obj, instanceId) {
  if (obj.userData && obj.userData.editorLabel) return obj.userData.editorLabel;
  if (obj.isInstancedMesh && instanceId >= 0) {
    return _meshTypeName(obj) + ' #' + instanceId;
  }
  if (obj.name) return obj.name;
  if (obj.isInstancedMesh) return _meshTypeName(obj);
  if (obj.isMesh) return _meshTypeName(obj);
  return 'Object';
}

function _meshTypeName(mesh) {
  const geo = mesh.geometry;
  if (!geo) return 'Mesh';
  const t = geo.type || '';
  if (t.includes('Box')) return 'Box';
  if (t.includes('Cylinder')) return 'Cylinder';
  if (t.includes('Sphere')) return 'Sphere';
  if (t.includes('Plane')) return 'Plane';
  return t || 'Mesh';
}

// ── Internal: Edge Highlight ─────────────────────────────────

function _createHighlight(obj, instanceId) {
  _clearHighlight();
  highlightGroup = new THREE.Group();

  if (obj.isInstancedMesh && instanceId >= 0) {
    const matrix = new THREE.Matrix4();
    obj.getMatrixAt(instanceId, matrix);
    if (obj.geometry) {
      const edges = new THREE.EdgesGeometry(obj.geometry, 15);
      const line = new THREE.LineSegments(edges,
        new THREE.LineBasicMaterial({ color: 0xffff00, depthTest: true }));
      line.applyMatrix4(matrix);
      highlightGroup.add(line);
    }
  } else if (obj.isMesh && !obj.isInstancedMesh) {
    const edges = new THREE.EdgesGeometry(obj.geometry, 15);
    const line = new THREE.LineSegments(edges,
      new THREE.LineBasicMaterial({ color: 0xffff00, depthTest: true }));
    obj.getWorldPosition(line.position);
    obj.getWorldQuaternion(line.quaternion);
    obj.getWorldScale(line.scale);
    highlightGroup.add(line);
  }

  scene.add(highlightGroup);
}

function _clearHighlight() {
  if (highlightGroup) {
    scene.remove(highlightGroup);
    highlightGroup.traverse((c) => {
      if (c.geometry) c.geometry.dispose();
      if (c.material) c.material.dispose();
    });
    highlightGroup = null;
  }
}

// ── Internal: Modal DOM ─────────────────────────────────────

function _buildModalDOM() {
  const style = document.createElement('style');
  style.textContent = `
    #feModalBackdrop{position:fixed;inset:0;z-index:2000;background:rgba(0,0,0,0.55);display:none;}
    #feModalBackdrop.open{display:flex;align-items:center;justify-content:center;}
    #feModal{background:#1e1e2e;color:#cdd6f4;border-radius:12px;padding:24px;width:800px;max-height:90vh;display:flex;flex-direction:column;font-family:'Segoe UI',sans-serif;box-shadow:0 8px 32px rgba(0,0,0,0.5);}
    #feModalHeader{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;}
    #feModalTitle{font-size:20px;font-weight:700;}
    #feModalSource{font-size:14px;color:#89b4fa;margin-bottom:10px;}
    #feModalClose{background:none;border:none;color:#cdd6f4;font-size:28px;cursor:pointer;padding:0 6px;}
    #feModalClose:hover{color:#fff;}
    #feEditorData{width:100%;height:450px;background:#11111b;color:#a6e3a1;border:1px solid #313244;border-radius:8px;padding:14px;font-family:'JetBrains Mono','Fira Code',monospace;font-size:15px;resize:vertical;white-space:pre;tab-size:2;line-height:1.5;}
    #feEditorActions{display:flex;gap:10px;margin-top:14px;flex-wrap:wrap;}
    #feEditorSave{background:#a6e3a1;color:#1e1e2e;border:none;padding:10px 24px;border-radius:8px;font-weight:700;cursor:pointer;font-size:15px;}
    #feEditorSave:hover{background:#94d89a;}
    #feEditorDelete{background:#f38ba8;color:#1e1e2e;border:none;padding:10px 24px;border-radius:8px;font-weight:700;cursor:pointer;font-size:15px;}
    #feEditorDelete:hover{background:#e07a96;}
    #feEditorAI{background:#89b4fa;color:#1e1e2e;border:none;padding:10px 24px;border-radius:8px;font-weight:700;cursor:pointer;font-size:15px;}
    #feEditorAI:hover{background:#7aa2f0;}
    #feEditorHistory{background:#6c7086;color:#1e1e2e;border:none;padding:10px 24px;border-radius:8px;font-weight:700;cursor:pointer;font-size:15px;}
    #feEditorHistory:hover{background:#585b70;}
    #feAIPanel{margin-top:14px;display:none;flex-direction:column;gap:8px;}
    #feAIPanel.open{display:flex;}
    #feAIPromptInput{width:100%;background:#11111b;color:#cdd6f4;border:1px solid #89b4fa;border-radius:8px;padding:10px;font-size:15px;}
    #feAIPromptSend{background:#cba6f7;color:#1e1e2e;border:none;padding:8px 20px;border-radius:8px;font-weight:700;cursor:pointer;align-self:flex-start;font-size:15px;}
    #feAIPromptSend:hover{background:#b893e8;}
    #feAIPromptStatus{font-size:14px;color:#f9e2af;min-height:20px;}
    #feDeleteConfirm{display:none;margin-top:12px;padding:12px;background:#2a1a1f;border:1px solid #f38ba8;border-radius:8px;font-size:15px;}
    #feDeleteConfirmText{margin-bottom:10px;}
    #feDeleteConfirmYes{background:#f38ba8;color:#1e1e2e;border:none;padding:8px 20px;border-radius:6px;font-weight:700;cursor:pointer;margin-right:10px;font-size:15px;}
    #feDeleteConfirmNo{background:#313244;color:#cdd6f4;border:none;padding:8px 20px;border-radius:6px;cursor:pointer;font-size:15px;}
    #feToast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:3000;padding:10px 24px;border-radius:8px;font-size:16px;font-family:monospace;opacity:0;transition:opacity 0.3s;pointer-events:none;}
    #feHistoryPanel{margin-top:14px;display:none;flex-direction:column;gap:6px;max-height:250px;overflow-y:auto;background:#11111b;border:1px solid #313244;border-radius:8px;padding:10px;}
    #feHistoryPanel.open{display:flex;}
    .feHistoryItem{padding:8px 10px;border-radius:6px;font-size:13px;font-family:monospace;border-left:3px solid #555;line-height:1.5;}
    .feHistoryItem.silindi{border-left-color:#f38ba8;background:#1a1015;}
    .feHistoryItem.eklendi{border-left-color:#a6e3a1;background:#101a12;}
    .feHistoryItem.değiştirildi{border-left-color:#f9e2af;background:#1a1810;}
    .feHistoryItem.AI{border-left-color:#89b4fa;background:#10141a;}
    .feHistoryTime{color:#6c7086;margin-bottom:2px;}
    .feHistoryDesc{color:#cdd6f4;}
    .feHistoryCode{color:#a6adc8;margin-top:4px;white-space:pre-wrap;word-break:break-all;max-height:80px;overflow-y:auto;font-size:12px;}
  `;
  document.head.appendChild(style);

  const backdrop = document.createElement('div');
  backdrop.id = 'feModalBackdrop';
  backdrop.innerHTML = `
    <div id="feModal">
      <div id="feModalHeader">
        <span id="feModalTitle">Live Editor</span>
        <button id="feModalClose">&times;</button>
      </div>
      <div id="feModalSource"></div>
      <textarea id="feEditorData" spellcheck="false"></textarea>
      <div id="feEditorActions">
        <button id="feEditorSave">Kaydet (Save)</button>
        <button id="feEditorDelete">Sil (Delete)</button>
        <button id="feEditorAI">AI Assist</button>
        <button id="feEditorHistory">Geçmiş</button>
      </div>
      <div id="feDeleteConfirm">
        <div id="feDeleteConfirmText">Bu objeyi silmek istediğine emin misin? Kaynak kodda yorum satırına çevrilecek.</div>
        <button id="feDeleteConfirmYes">Evet, Sil</button>
        <button id="feDeleteConfirmNo">İptal</button>
      </div>
      <div id="feAIPanel">
        <input id="feAIPromptInput" placeholder="Ne değişsin? (örn: rengi mavi yap, boyutunu 2 katına çıkar)">
        <button id="feAIPromptSend">AI'a Gönder</button>
        <div id="feAIPromptStatus"></div>
      </div>
      <div id="feHistoryPanel"></div>
    </div>
  `;
  document.body.appendChild(backdrop);

  const toast = document.createElement('div');
  toast.id = 'feToast';
  document.body.appendChild(toast);

  modalEl = {
    backdrop,
    title: document.getElementById('feModalTitle'),
    source: document.getElementById('feModalSource'),
    textarea: document.getElementById('feEditorData'),
    saveBtn: document.getElementById('feEditorSave'),
    deleteBtn: document.getElementById('feEditorDelete'),
    aiBtn: document.getElementById('feEditorAI'),
    aiPanel: document.getElementById('feAIPanel'),
    aiInput: document.getElementById('feAIPromptInput'),
    aiSend: document.getElementById('feAIPromptSend'),
    aiStatus: document.getElementById('feAIPromptStatus'),
    historyPanel: document.getElementById('feHistoryPanel'),
    historyBtn: document.getElementById('feEditorHistory'),
    deleteConfirm: document.getElementById('feDeleteConfirm'),
    deleteConfirmText: document.getElementById('feDeleteConfirmText'),
    deleteConfirmYes: document.getElementById('feDeleteConfirmYes'),
    deleteConfirmNo: document.getElementById('feDeleteConfirmNo'),
    toast: document.getElementById('feToast'),
  };

  document.getElementById('feModalClose').addEventListener('click', _closeModal);
  modalEl.saveBtn.addEventListener('click', _onSave);
  modalEl.deleteBtn.addEventListener('click', _onDeleteRequest);
  modalEl.deleteConfirmYes.addEventListener('click', _onDeleteConfirm);
  modalEl.deleteConfirmNo.addEventListener('click', _onDeleteCancel);
  modalEl.aiBtn.addEventListener('click', _toggleAIPanel);
  modalEl.aiSend.addEventListener('click', _onAISend);
  modalEl.historyBtn.addEventListener('click', _toggleHistory);
}

// ── Internal: Modal open/close ──────────────────────────────

async function _openModal(obj, instanceId, sourceFile) {
  if (!modalEl) return;
  const label = _objectLabel(obj, instanceId);
  modalEl.title.textContent = label;
  modalEl.source.textContent = sourceFile ? 'Kaynak: ' + sourceFile : 'Kaynak: bilinmiyor (JSON modu)';
  modalEl.deleteConfirm.style.display = 'none';
  modalEl.backdrop.classList.add('open');
  _closeAIPanel();
  document.exitPointerLock();

  if (sourceFile) {
    modalEl.textarea.value = 'Yükleniyor...';
    const content = await _loadSourceFile(sourceFile);
    modalEl.textarea.value = content;
    originalContent = content;
  } else {
    const jsonStr = _serializeToJSON(obj, instanceId);
    modalEl.textarea.value = jsonStr;
    originalContent = jsonStr;
  }
}

function _closeModal() {
  if (!modalEl) return;
  modalEl.backdrop.classList.remove('open');
  _closeAIPanel();
  modalEl.deleteConfirm.style.display = 'none';
  selectedObject = null;
  selectedInstanceId = -1;
  selectedSourceFile = null;
  if (freecamActive && domElement) {
    domElement.requestPointerLock();
  }
}

// ── Internal: Source file read/write ────────────────────────

async function _loadSourceFile(filePath) {
  try {
    const res = await fetch('/api/source-file?file=' + encodeURIComponent(filePath));
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    return data.content;
  } catch (err) {
    return '// Yüklenemedi: ' + err.message + '\n// Dosya: ' + filePath;
  }
}

async function _saveSourceFile(filePath, content) {
  const res = await fetch('/api/source-file', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file: filePath, content }),
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

async function _commentLines(filePath, startLine, endLine) {
  const res = await fetch('/api/comment-lines', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file: filePath, startLine, endLine }),
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

// ── Internal: JSON fallback serialize ───────────────────────

function _serializeToJSON(obj, instanceId) {
  if (obj.isInstancedMesh && instanceId >= 0) {
    const matrix = new THREE.Matrix4();
    obj.getMatrixAt(instanceId, matrix);
    const pos = new THREE.Vector3();
    const quat = new THREE.Quaternion();
    const scl = new THREE.Vector3();
    matrix.decompose(pos, quat, scl);
    const euler = new THREE.Euler().setFromQuaternion(quat);

    let json = '// InstancedMeshInstance — ' + _meshTypeName(obj) + ' #' + instanceId + '\n';
    json += '// totalInstances: ' + obj.count + '\n';
    json += '// Bu obje prosedürel olarak oluşturuldu. Kaynak dosya: client/zones/world.js\n';
    json += '// Değişiklikleri kalıcı yapmak için kaynak dosyayı düzenleyin.\n';
    json += JSON.stringify({
      worldPosition: { x: +pos.x.toFixed(4), y: +pos.y.toFixed(4), z: +pos.z.toFixed(4) },
      worldRotation: { x: +euler.x.toFixed(4), y: +euler.y.toFixed(4), z: +euler.z.toFixed(4) },
      worldScale:    { x: +scl.x.toFixed(4), y: +scl.y.toFixed(4), z: +scl.z.toFixed(4) },
    }, null, 2);
    return json;
  }

  let json = '// ' + (obj.isMesh ? 'Mesh' : 'Object3D') + ' — ' + _objectLabel(obj, -1) + '\n';
  json += '// Kalıcı değişiklik için kaynak dosyayı düzenleyin.\n';
  json += JSON.stringify({
    position: { x: +obj.position.x.toFixed(4), y: +obj.position.y.toFixed(4), z: +obj.position.z.toFixed(4) },
    rotation: { x: +obj.rotation.x.toFixed(4), y: +obj.rotation.y.toFixed(4), z: +obj.rotation.z.toFixed(4) },
    scale:    { x: +obj.scale.x.toFixed(4), y: +obj.scale.y.toFixed(4), z: +obj.scale.z.toFixed(4) },
    visible: obj.visible,
    castShadow: obj.castShadow || false,
    material: obj.isMesh && obj.material && obj.material.color ? {
      color: '#' + obj.material.color.getHexString(),
    } : undefined,
  }, null, 2);
  return json;
}

function _applyJSONToObject(obj, instanceId, jsonStr) {
  const data = JSON.parse(jsonStr);

  if (obj.isInstancedMesh && instanceId >= 0 && data.worldPosition) {
    for (const axis of ['x', 'y', 'z']) {
      if (!isFinite(data.worldPosition[axis]) || !isFinite(data.worldRotation[axis]) || !isFinite(data.worldScale[axis])) {
        throw new Error('Invalid value in ' + axis);
      }
    }
    const pos = new THREE.Vector3(data.worldPosition.x, data.worldPosition.y, data.worldPosition.z);
    const euler = new THREE.Euler(data.worldRotation.x, data.worldRotation.y, data.worldRotation.z);
    const quat = new THREE.Quaternion().setFromEuler(euler);
    const scl = new THREE.Vector3(data.worldScale.x, data.worldScale.y, data.worldScale.z);
    const matrix = new THREE.Matrix4();
    matrix.compose(pos, quat, scl);
    obj.setMatrixAt(instanceId, matrix);
    obj.instanceMatrix.needsUpdate = true;
    return;
  }

  if (data.position && data.rotation && data.scale) {
    obj.position.set(data.position.x, data.position.y, data.position.z);
    obj.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
    obj.scale.set(data.scale.x, data.scale.y, data.scale.z);
    if (typeof data.visible === 'boolean') obj.visible = data.visible;
    if (typeof data.castShadow === 'boolean') obj.castShadow = data.castShadow;
    if (data.material && data.material.color && obj.isMesh && obj.material && obj.material.color) {
      obj.material.color.set(data.material.color);
    }
  }
}

// ── Internal: Line detection for delete ─────────────────────

function _findObjectLineRange(content, obj, instanceId) {
  // Returns { startLine, endLine } or null if can't determine
  // For InstancedMesh: can't determine specific instance → don't comment lines
  if (obj.isInstancedMesh) return null;

  const label = _objectLabel(obj, instanceId);
  const lines = content.split('\n');
  // Search for the function or object creation pattern
  // Look for function definitions that match
  const searchTerms = [label, obj.name, obj.userData && obj.userData.editorLabel].filter(Boolean);

  for (const term of searchTerms) {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(term)) {
        // Find the enclosing block
        let start = i;
        let end = i;
        let braceCount = 0;
        // Go back to find function start or statement start
        while (start > 0 && !lines[start].trim().startsWith('function') && !lines[start].trim().startsWith('//')) {
          start--;
        }
        // Go forward to find matching closing brace
        for (let j = i; j < lines.length; j++) {
          braceCount += (lines[j].match(/\{/g) || []).length;
          braceCount -= (lines[j].match(/\}/g) || []).length;
          if (braceCount <= 0 && j > i) { end = j; break; }
          end = j;
        }
        return { startLine: start + 1, endLine: end + 1 };
      }
    }
  }
  return null;
}

// ── Internal: Action Logging ─────────────────────────────────

function _computeDiff(oldText, newText) {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  const changes = [];

  // Find changed line ranges
  let i = 0;
  while (i < Math.max(oldLines.length, newLines.length)) {
    const oldLine = i < oldLines.length ? oldLines[i] : null;
    const newLine = i < newLines.length ? newLines[i] : null;

    if (oldLine !== newLine) {
      // Find the end of this change block
      let j = i;
      const maxCheck = Math.min(
        Math.max(oldLines.length, newLines.length) - j,
        20
      );
      while (j - i < maxCheck) {
        const ol = j < oldLines.length ? oldLines[j] : null;
        const nl = j < newLines.length ? newLines[j] : null;
        if (ol === nl && j > i) break;
        j++;
      }

      const oldSnippet = oldLines.slice(i, Math.min(j, oldLines.length)).join('\n');
      const newSnippet = newLines.slice(i, Math.min(j, newLines.length)).join('\n');

      if (oldSnippet && !newSnippet) {
        changes.push({
          lineStart: i + 1,
          lineEnd: Math.min(j, oldLines.length),
          type: 'silindi',
          code: oldSnippet,
        });
      } else if (!oldSnippet && newSnippet) {
        changes.push({
          lineStart: i + 1,
          lineEnd: i + 1,
          type: 'eklendi',
          code: newSnippet,
        });
      } else {
        changes.push({
          lineStart: i + 1,
          lineEnd: Math.min(j, Math.max(oldLines.length, newLines.length)),
          type: 'değiştirildi',
          code: oldSnippet.substring(0, 200),
          newCode: newSnippet.substring(0, 200),
        });
      }
      i = j;
    } else {
      i++;
    }
  }

  return changes;
}

async function _logAction(operation, detail) {
  try {
    await fetch('/api/editor-actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operation,
        sourceFile: detail.sourceFile || null,
        objectLabel: detail.objectLabel || null,
        lineStart: detail.lineStart || null,
        lineEnd: detail.lineEnd || null,
        codeSnippet: detail.codeSnippet || null,
        detail: detail.description || null,
      }),
    });
  } catch (_) { /* non-critical */ }
}

async function _onSave() {
  try {
    if (!selectedObject) return;
    const newContent = modalEl.textarea.value;
    const label = _objectLabel(selectedObject, selectedInstanceId);

    // If it's JSON mode (no source file), apply JSON to object directly
    if (!selectedSourceFile) {
      _applyJSONToObject(selectedObject, selectedInstanceId, newContent);
      _clearHighlight();
      _createHighlight(selectedObject, selectedInstanceId);

      // Log JSON edit
      const changes = _computeDiff(originalContent, newContent);
      for (const c of changes) {
        await _logAction(c.type, {
          sourceFile: null,
          objectLabel: label,
          lineStart: c.lineStart,
          lineEnd: c.lineEnd,
          codeSnippet: c.code || c.newCode,
          description: `${label} — JSON ${c.type} (geçici)`,
        });
      }
      originalContent = newContent;
      _showToast('Kaydedildi (geçici — sayfa yenilenince sıfırlanır)', '#f9e2af');
      return;
    }

    // Save source file to disk
    await _saveSourceFile(selectedSourceFile, newContent);

    // Compute diff and log each change
    const changes = _computeDiff(originalContent, newContent);
    for (const c of changes) {
      const detailParts = [];
      if (c.type === 'silindi') {
        detailParts.push(`${selectedSourceFile} satır ${c.lineStart}-${c.lineEnd} silindi`);
      } else if (c.type === 'eklendi') {
        detailParts.push(`${selectedSourceFile} satır ${c.lineStart} kod eklendi`);
      } else {
        detailParts.push(`${selectedSourceFile} satır ${c.lineStart}-${c.lineEnd} değiştirildi`);
      }
      await _logAction(c.type, {
        sourceFile: selectedSourceFile,
        objectLabel: label,
        lineStart: c.lineStart,
        lineEnd: c.lineEnd,
        codeSnippet: c.code || c.newCode,
        description: detailParts.join(' — ') + `\nEski: ${(c.code || '').substring(0, 150)}\nYeni: ${(c.newCode || c.code || '').substring(0, 150)}`,
      });
    }
    originalContent = newContent;

    // Also try to apply JSON changes if the content contains JSON
    try {
      const trimmed = newContent.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('//')) {
        const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          _applyJSONToObject(selectedObject, selectedInstanceId, jsonMatch[0]);
        }
      }
    } catch (_) { /* non-JSON edits are fine, source file already saved */ }

    _clearHighlight();
    _createHighlight(selectedObject, selectedInstanceId);
    _showToast('Kaydedildi! Kaynak dosya güncellendi.', '#a6e3a1');
    console.log('[FreeCamEditor] source file saved:', selectedSourceFile);
  } catch (err) {
    _showToast('Hata: ' + err.message, '#f38ba8');
  }
}

function _onDeleteRequest() {
  if (!modalEl || !selectedObject) return;
  const label = _objectLabel(selectedObject, selectedInstanceId);
  modalEl.deleteConfirmText.textContent =
    label + ' silinecek. Kaynak kodda ilgili satırlar yorum satırına çevrilecek. Emin misin?';
  modalEl.deleteConfirm.style.display = 'block';
}

function _onDeleteCancel() {
  if (!modalEl) return;
  modalEl.deleteConfirm.style.display = 'none';
}

async function _onDeleteConfirm() {
  if (!modalEl || !selectedObject) return;
  modalEl.deleteConfirm.style.display = 'none';

  try {
    const label = _objectLabel(selectedObject, selectedInstanceId);

    // Hide object in scene
    if (selectedObject.isInstancedMesh) {
      selectedObject.userData._editorDeleted = true;
      selectedObject.visible = false;
    } else {
      selectedObject.visible = false;
      selectedObject.userData._editorDeleted = true;
      selectedObject.traverse((c) => { if (c.isMesh) c.visible = false; });
    }

    // Register deletion persistently via API
    const pos = new THREE.Vector3();
    if (selectedObject.isInstancedMesh && selectedInstanceId >= 0) {
      const matrix = new THREE.Matrix4();
      selectedObject.getMatrixAt(selectedInstanceId, matrix);
      pos.setFromMatrixPosition(matrix);
    } else {
      selectedObject.getWorldPosition(pos);
    }

    await fetch('/api/deletions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        label,
        sourceFile: selectedSourceFile,
        isInstancedMesh: !!selectedObject.isInstancedMesh,
        instanceId: selectedInstanceId,
        position: { x: +pos.x.toFixed(2), y: +pos.y.toFixed(2), z: +pos.z.toFixed(2) },
        meshType: selectedObject.isInstancedMesh ? _meshTypeName(selectedObject) : (selectedObject.geometry ? selectedObject.geometry.type : null),
      }),
    });

    // Try source-code commenting as well (best-effort)
    let deletedLines = null;
    if (selectedSourceFile) {
      const content = await _loadSourceFile(selectedSourceFile);
      const range = _findObjectLineRange(content, selectedObject, selectedInstanceId);

      if (range) {
        const lines = content.split('\n');
        const deletedCode = lines.slice(range.startLine - 1, range.endLine).join('\n');
        await _commentLines(selectedSourceFile, range.startLine, range.endLine);
        deletedLines = { start: range.startLine, end: range.endLine, code: deletedCode };
        _showToast('Silindi! ' + label + ' → kaynak kod yorum satırı + kayıt.', '#f38ba8');
      } else {
        _showToast('Silindi! ' + label + ' → kalıcı kayıt eklendi (sayfa yenilense de gizli kalır).', '#a6e3a1');
      }
    } else {
      _showToast('Silindi! ' + label + ' → kalıcı kayıt eklendi.', '#a6e3a1');
    }

    // Log the deletion action
    if (deletedLines) {
      await _logAction('silindi', {
        sourceFile: selectedSourceFile,
        objectLabel: label,
        lineStart: deletedLines.start,
        lineEnd: deletedLines.end,
        codeSnippet: deletedLines.code.substring(0, 300),
        description: `${selectedSourceFile} satır ${deletedLines.start}-${deletedLines.end} silindi — ${label}`,
      });
    } else {
      await _logAction('silindi', {
        sourceFile: selectedSourceFile,
        objectLabel: label,
        codeSnippet: `Pozisyon: ${pos.x}, ${pos.y}, ${pos.z} | Mesh: ${selectedObject.isInstancedMesh ? _meshTypeName(selectedObject) : (selectedObject.geometry ? selectedObject.geometry.type : '?')}`,
        description: `${selectedSourceFile || 'bilinmeyen dosya'} — ${label} sahneden gizlendi (kalıcı kayıt)`,
      });
    }

    _clearHighlight();
    currentHovered = null;
    currentInstanceId = -1;
    _closeModal();
  } catch (err) {
    _showToast('Silme hatası: ' + err.message, '#f38ba8');
  }
}

// ── Internal: History panel ─────────────────────────────────

async function _toggleHistory() {
  const panel = modalEl.historyPanel;
  if (panel.classList.contains('open')) {
    panel.classList.remove('open');
    return;
  }
  panel.classList.add('open');
  await _loadHistory();
}

async function _loadHistory() {
  const panel = modalEl.historyPanel;
  panel.innerHTML = '<div class="feHistoryItem" style="color:#6c7086">Yükleniyor...</div>';
  try {
    const res = await fetch('/api/editor-actions?limit=50');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const actions = await res.json();
    if (!actions.length) {
      panel.innerHTML = '<div class="feHistoryItem" style="color:#6c7086">Henüz kayıt yok.</div>';
      return;
    }
    panel.innerHTML = actions.reverse().map(a => {
      const opClass = a.operation.includes('AI') ? 'AI' :
        a.operation === 'silindi' ? 'silindi' :
        a.operation === 'eklendi' ? 'eklendi' :
        a.operation === 'değiştirildi' ? 'değiştirildi' : '';
      const time = new Date(a.timestamp).toLocaleTimeString('tr-TR');
      const fileInfo = a.sourceFile ? `<span style="color:#89b4fa">${a.sourceFile}</span>` : '';
      const lineInfo = a.lineStart ? ` satır ${a.lineStart}${a.lineEnd && a.lineEnd !== a.lineStart ? '-' + a.lineEnd : ''}` : '';
      const codeHtml = a.codeSnippet
        ? `<div class="feHistoryCode">${_escapeHTML(a.codeSnippet.substring(0, 200))}</div>`
        : '';
      return `<div class="feHistoryItem ${opClass}">
        <div class="feHistoryTime">${time} — <b>${a.operation}</b></div>
        <div class="feHistoryDesc">${fileInfo}${lineInfo} — ${_escapeHTML(a.objectLabel || '')}</div>
        ${codeHtml}
      </div>`;
    }).join('');
  } catch (err) {
    panel.innerHTML = '<div class="feHistoryItem" style="color:#f38ba8">Yüklenemedi: ' + err.message + '</div>';
  }
}

function _escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ── Internal: AI panel ──────────────────────────────────────

function _toggleAIPanel() {
  if (modalEl.aiPanel.classList.contains('open')) {
    _closeAIPanel();
  } else {
    modalEl.aiPanel.classList.add('open');
    modalEl.aiStatus.textContent = '';
  }
}

function _closeAIPanel() {
  modalEl.aiPanel.classList.remove('open');
  modalEl.aiInput.value = '';
  modalEl.aiStatus.textContent = '';
  if (aiPollTimer) { clearInterval(aiPollTimer); aiPollTimer = null; }
}

async function _onAISend() {
  const prompt = modalEl.aiInput.value.trim();
  if (!prompt) return;
  modalEl.aiStatus.textContent = 'İstek kuyruğa alınıyor...';
  modalEl.aiSend.disabled = true;

  const label = _objectLabel(selectedObject, selectedInstanceId);

  try {
    const payload = {
      currentState: { sourceFile: selectedSourceFile, objectLabel: label },
      userPrompt: prompt,
    };
    const res = await fetch('/api/ai-edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);

    // Log AI request
    await _logAction('AI istek', {
      sourceFile: selectedSourceFile,
      objectLabel: label,
      codeSnippet: prompt,
      description: `${selectedSourceFile || 'bilinmeyen'} — ${label} için AI isteği gönderildi: "${prompt}"`,
    });

    modalEl.aiStatus.textContent = 'İstek kuyrukta. AI yanıtı bekleniyor...';
    _startAIPoll();
  } catch (err) {
    modalEl.aiStatus.textContent = 'Hata: ' + err.message;
    modalEl.aiSend.disabled = false;
  }
}

function _startAIPoll() {
  if (aiPollTimer) clearInterval(aiPollTimer);
  let elapsed = 0;
  const label = _objectLabel(selectedObject, selectedInstanceId);
  aiPollTimer = setInterval(async () => {
    elapsed += 3;
    try {
      const res = await fetch('/api/ai-response');
      if (res.ok) {
        const data = await res.json();
        clearInterval(aiPollTimer);
        aiPollTimer = null;
        const aiResponse = data.newState && typeof data.newState === 'string'
          ? data.newState
          : (data.newState ? JSON.stringify(data.newState, null, 2) : '');
        if (aiResponse) {
          modalEl.textarea.value = aiResponse;
        }
        modalEl.aiStatus.textContent = 'AI yanıtı geldi! Gözden geçir ve Kaydet.';
        modalEl.aiSend.disabled = false;
        _showToast('AI yanıtı alındı', '#89b4fa');

        // Log AI response
        await _logAction('AI yanıt', {
          sourceFile: selectedSourceFile,
          objectLabel: label,
          codeSnippet: aiResponse.substring(0, 500),
          description: `${selectedSourceFile || 'bilinmeyen'} — ${label} için AI yanıtı alındı`,
        });
      } else if (elapsed >= 30) {
        clearInterval(aiPollTimer);
        aiPollTimer = null;
        modalEl.aiStatus.textContent = 'Zaman aşımı (30sn).';
        modalEl.aiSend.disabled = false;
        await _logAction('AI zaman aşımı', {
          sourceFile: selectedSourceFile,
          objectLabel: label,
          description: `${selectedSourceFile || 'bilinmeyen'} — ${label} için AI yanıtı 30sn içinde gelmedi`,
        });
      }
    } catch {
      if (elapsed >= 30) {
        clearInterval(aiPollTimer);
        aiPollTimer = null;
        modalEl.aiStatus.textContent = 'Bağlantı hatası.';
        modalEl.aiSend.disabled = false;
      }
    }
  }, 3000);
}

// ── Internal: Toast ─────────────────────────────────────────

function _showToast(msg, color) {
  if (!modalEl || !modalEl.toast) return;
  const t = modalEl.toast;
  t.textContent = msg;
  t.style.background = color;
  t.style.opacity = '1';
  clearTimeout(t._tid);
  t._tid = setTimeout(() => { t.style.opacity = '0'; }, 2200);
}
