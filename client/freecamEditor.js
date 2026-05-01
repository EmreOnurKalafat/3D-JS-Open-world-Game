// client/freecamEditor.js — Live Editor for FreeCam mode
// Shows raw source code, persists changes to disk, supports delete+comment

import * as THREE from 'three';

// ── Module state ────────────────────────────────────────────
let scene, camera;
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

// ── Public API ──────────────────────────────────────────────

export function initFreecamEditor(scn, cam, domEl) {
  scene = scn;
  camera = cam;
  raycaster = new THREE.Raycaster();
  mouseNDC = new THREE.Vector2(0, 0);
  raycaster.far = 500;

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

export function updateFreecamEditor() {
  if (!freecamActive || isEditorModalOpen()) return;

  raycaster.setFromCamera(mouseNDC, camera);
  const targets = _collectAllTargets();
  const hits = raycaster.intersectObjects(targets, false);

  if (hits.length > 0) {
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

  if (obj.isInstancedMesh) return 'client/world.js';

  let cur = obj;
  while (cur) {
    if (cur.userData && cur.userData.sourceFile) return cur.userData.sourceFile;
    if (cur.name && cur.name.toLowerCase().includes('hospital')) return 'client/hospital.js';
    if (cur.userData && cur.userData.type === 'police') return 'client/policeStation.js';
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
    #feModal{background:#1e1e2e;color:#cdd6f4;border-radius:10px;padding:16px;width:600px;max-height:85vh;display:flex;flex-direction:column;font-family:'Segoe UI',sans-serif;box-shadow:0 8px 32px rgba(0,0,0,0.5);}
    #feModalHeader{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;}
    #feModalTitle{font-size:15px;font-weight:600;}
    #feModalSource{font-size:11px;color:#89b4fa;margin-bottom:6px;}
    #feModalClose{background:none;border:none;color:#cdd6f4;font-size:20px;cursor:pointer;padding:0 4px;}
    #feModalClose:hover{color:#fff;}
    #feEditorData{width:100%;height:360px;background:#11111b;color:#a6e3a1;border:1px solid #313244;border-radius:6px;padding:10px;font-family:'JetBrains Mono','Fira Code',monospace;font-size:13px;resize:vertical;white-space:pre;tab-size:2;}
    #feEditorActions{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;}
    #feEditorSave{background:#a6e3a1;color:#1e1e2e;border:none;padding:8px 20px;border-radius:6px;font-weight:600;cursor:pointer;}
    #feEditorSave:hover{background:#94d89a;}
    #feEditorDelete{background:#f38ba8;color:#1e1e2e;border:none;padding:8px 20px;border-radius:6px;font-weight:600;cursor:pointer;}
    #feEditorDelete:hover{background:#e07a96;}
    #feEditorAI{background:#89b4fa;color:#1e1e2e;border:none;padding:8px 20px;border-radius:6px;font-weight:600;cursor:pointer;}
    #feEditorAI:hover{background:#7aa2f0;}
    #feAIPanel{margin-top:10px;display:none;flex-direction:column;gap:6px;}
    #feAIPanel.open{display:flex;}
    #feAIPromptInput{width:100%;background:#11111b;color:#cdd6f4;border:1px solid #89b4fa;border-radius:6px;padding:8px;font-size:13px;}
    #feAIPromptSend{background:#cba6f7;color:#1e1e2e;border:none;padding:6px 16px;border-radius:6px;font-weight:600;cursor:pointer;align-self:flex-start;}
    #feAIPromptSend:hover{background:#b893e8;}
    #feAIPromptStatus{font-size:12px;color:#f9e2af;min-height:18px;}
    #feDeleteConfirm{display:none;margin-top:8px;padding:8px;background:#2a1a1f;border:1px solid #f38ba8;border-radius:6px;font-size:13px;}
    #feDeleteConfirmText{margin-bottom:6px;}
    #feDeleteConfirmYes{background:#f38ba8;color:#1e1e2e;border:none;padding:4px 16px;border-radius:4px;font-weight:600;cursor:pointer;margin-right:8px;}
    #feDeleteConfirmNo{background:#313244;color:#cdd6f4;border:none;padding:4px 16px;border-radius:4px;cursor:pointer;}
    #feToast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:3000;padding:8px 20px;border-radius:6px;font-size:14px;font-family:monospace;opacity:0;transition:opacity 0.3s;pointer-events:none;}
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

  if (sourceFile) {
    modalEl.textarea.value = 'Yükleniyor...';
    const content = await _loadSourceFile(sourceFile);
    modalEl.textarea.value = content;
  } else {
    modalEl.textarea.value = _serializeToJSON(obj, instanceId);
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
    json += '// Bu obje prosedürel olarak oluşturuldu. Kaynak dosya: client/world.js\n';
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

// ── Internal: Actions ───────────────────────────────────────

async function _onSave() {
  try {
    if (!selectedObject) return;
    const content = modalEl.textarea.value;

    // If it's JSON mode (no source file), apply JSON to object directly
    if (!selectedSourceFile) {
      _applyJSONToObject(selectedObject, selectedInstanceId, content);
      _clearHighlight();
      _createHighlight(selectedObject, selectedInstanceId);
      _showToast('Kaydedildi (geçici — sayfa yenilenince sıfırlanır)', '#f9e2af');
      return;
    }

    // Save source file to disk
    await _saveSourceFile(selectedSourceFile, content);

    // Also try to apply JSON changes if the content contains JSON
    try {
      const trimmed = content.trim();
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
      // For InstancedMesh, mark the mesh as having deleted instances
      // We can't truly delete a single instance, so hide the whole mesh
      selectedObject.userData._editorDeleted = true;
      selectedObject.visible = false;
    } else {
      selectedObject.visible = false;
      selectedObject.userData._editorDeleted = true;
      // Also hide children
      selectedObject.traverse((c) => { if (c.isMesh) c.visible = false; });
    }

    // Comment out relevant lines in source file
    if (selectedSourceFile) {
      const content = await _loadSourceFile(selectedSourceFile);
      const range = _findObjectLineRange(content, selectedObject, selectedInstanceId);

      if (range) {
        await _commentLines(selectedSourceFile, range.startLine, range.endLine);
        _showToast('Silindi! ' + label + ' → yorum satırı: ' + selectedSourceFile + ' L' + range.startLine + '-' + range.endLine, '#f38ba8');
      } else {
        // We can save the modified source, but the user needs to manually comment
        _showToast('Objeyi gizledi. Kaynak kodda otomatik satır bulunamadı — manuel yorum yapın.', '#f9e2af');
      }
    } else {
      _showToast(label + ' gizlendi (kaynak dosya bilinmiyor).', '#f9e2af');
    }

    _clearHighlight();
    currentHovered = null;
    currentInstanceId = -1;
    _closeModal();
  } catch (err) {
    _showToast('Silme hatası: ' + err.message, '#f38ba8');
  }
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

  try {
    const payload = {
      currentState: { sourceFile: selectedSourceFile, objectLabel: _objectLabel(selectedObject, selectedInstanceId) },
      userPrompt: prompt,
    };
    const res = await fetch('/api/ai-edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
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
  aiPollTimer = setInterval(async () => {
    elapsed += 3;
    try {
      const res = await fetch('/api/ai-response');
      if (res.ok) {
        const data = await res.json();
        clearInterval(aiPollTimer);
        aiPollTimer = null;
        if (data.newState && typeof data.newState === 'string') {
          modalEl.textarea.value = data.newState;
        } else if (data.newState) {
          modalEl.textarea.value = JSON.stringify(data.newState, null, 2);
        }
        modalEl.aiStatus.textContent = 'AI yanıtı geldi! Gözden geçir ve Kaydet.';
        modalEl.aiSend.disabled = false;
        _showToast('AI yanıtı alındı', '#89b4fa');
      } else if (elapsed >= 30) {
        clearInterval(aiPollTimer);
        aiPollTimer = null;
        modalEl.aiStatus.textContent = 'Zaman aşımı (30sn).';
        modalEl.aiSend.disabled = false;
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
