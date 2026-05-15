function safeReadStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch (error) {
    return fallback;
  }
}

function safeWriteStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

async function fetchPortalUpdates() {
  return placeProApi('/api/updates');
}

async function createPortalUpdate(payload) {
  return placeProApi('/api/updates', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

async function fetchOpportunities() {
  return placeProApi('/api/opportunities');
}

async function fetchRecruiterOpportunities(recruiterUserId) {
  return placeProApi(`/api/opportunities/recruiter/${encodeURIComponent(recruiterUserId)}`);
}

async function createOpportunity(payload) {
  return placeProApi('/api/opportunities', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

async function fetchApplications() {
  return placeProApi('/api/applications');
}

async function fetchRecruiterApplications(recruiterUserId) {
  return placeProApi(`/api/applications/recruiter/${encodeURIComponent(recruiterUserId)}`);
}

async function updateRecruiterApplication(applicationId, recruiterUserId, payload) {
  return placeProApi(`/api/applications/${encodeURIComponent(applicationId)}/recruiter/${encodeURIComponent(recruiterUserId)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

async function fetchStudentApplications(enrollmentNo) {
  return placeProApi(`/api/applications/student/${encodeURIComponent(enrollmentNo)}`);
}

async function createApplication(payload) {
  return placeProApi('/api/applications', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

async function fetchStudents() {
  return placeProApi('/api/students');
}

async function fetchStudentDocuments(enrollmentNo) {
  return placeProApi(`/api/student-documents/${encodeURIComponent(enrollmentNo)}`);
}

async function saveStudentDocument(enrollmentNo, payload) {
  return placeProApi(`/api/student-documents/${encodeURIComponent(enrollmentNo)}`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

function inferBranchNameFromEnrollment(rollNo, className) {
  const normalizedRoll = String(rollNo || '').toUpperCase();
  const branchMap = {
    CS: 'Computer Science',
    IT: 'Information Technology',
    EC: 'Electronics & Communication',
    EE: 'Electrical Engineering',
    EX: 'Electrical & Electronics',
    ME: 'Mechanical Engineering',
    CE: 'Civil Engineering',
    CA: 'Computer Applications'
  };
  const rollMatch = normalizedRoll.match(/[0-9]{2}([A-Z]{2})[0-9]/);
  const branchCode = rollMatch ? rollMatch[1] : '';
  if (branchCode && branchMap[branchCode]) {
    return branchMap[branchCode];
  }
  return className || 'Branch Not Available';
}

function mapDocumentsByType(documentList) {
  return (documentList || []).reduce((accumulator, document) => {
    accumulator[document.documentType] = {
      key: document.documentType,
      fileName: document.fileName,
      fileUrl: document.fileUrl,
      fileType: document.mimeType,
      fileSizeBytes: document.fileSizeBytes,
      uploadedAt: document.uploadedAt
    };
    return accumulator;
  }, {});
}

function inferBinaryMimeType(fileUrl, mimeType) {
  const normalizedMimeType = String(mimeType || '').trim().toLowerCase();
  if (normalizedMimeType && normalizedMimeType !== 'application/octet-stream') {
    return normalizedMimeType;
  }

  const raw = String(fileUrl || '').trim();
  if (!raw) {
    return normalizedMimeType || 'application/octet-stream';
  }

  if (raw.startsWith('data:')) {
    const firstComma = raw.indexOf(',');
    const metadata = firstComma === -1 ? raw.slice(5) : raw.slice(5, firstComma);
    const detectedFromDataUrl = metadata.split(';')[0].trim().toLowerCase();
    if (detectedFromDataUrl) {
      return detectedFromDataUrl;
    }
  }

  const cleaned = raw.replace(/\s+/g, '');
  if (cleaned.startsWith('JVBER')) {
    return 'application/pdf';
  }
  if (cleaned.startsWith('/9j/')) {
    return 'image/jpeg';
  }
  if (cleaned.startsWith('iVBORw0KGgo')) {
    return 'image/png';
  }
  if (cleaned.startsWith('R0lGOD')) {
    return 'image/gif';
  }
  if (cleaned.startsWith('UklGR')) {
    return 'image/webp';
  }

  return normalizedMimeType || 'application/octet-stream';
}

function normalizeBinaryAssetUrl(fileUrl, mimeType) {
  const raw = String(fileUrl || '').trim();
  if (!raw) {
    return '';
  }
  if (raw.startsWith('data:') || raw.startsWith('blob:') || /^https?:/i.test(raw)) {
    return raw;
  }

  // Some stored values may contain only the base64 payload.
  const cleaned = raw.replace(/\s+/g, '');
  return `data:${inferBinaryMimeType(raw, mimeType)};base64,${cleaned}`;
}

function createBinaryAssetBlobUrl(fileUrl, mimeType) {
  const normalizedUrl = normalizeBinaryAssetUrl(fileUrl, mimeType);
  if (!normalizedUrl.startsWith('data:')) {
    return normalizedUrl;
  }

  const firstComma = normalizedUrl.indexOf(',');
  if (firstComma === -1) {
    return normalizedUrl;
  }

  const metadata = normalizedUrl.slice(5, firstComma);
  const payload = normalizedUrl.slice(firstComma + 1);
  const resolvedMimeType = inferBinaryMimeType(normalizedUrl, metadata.split(';')[0] || mimeType);
  const isBase64 = metadata.includes(';base64');

  try {
    const bytes = isBase64
      ? Uint8Array.from(atob(payload), (character) => character.charCodeAt(0))
      : Uint8Array.from(decodeURIComponent(payload), (character) => character.charCodeAt(0));

    return URL.createObjectURL(new Blob([bytes], { type: resolvedMimeType }));
  } catch (error) {
    return normalizedUrl;
  }
}

function openBinaryAsset(fileUrl, mimeType, fileName) {
  const objectUrl = createBinaryAssetBlobUrl(fileUrl, mimeType);
  const openedWindow = window.open(objectUrl, '_blank', 'noopener,noreferrer');

  if (!openedWindow) {
    const link = document.createElement('a');
    link.href = objectUrl;
    link.target = '_blank';
    if (fileName) {
      link.download = fileName;
    }
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  if (objectUrl.startsWith('blob:')) {
    setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
  }
}

function downloadBinaryAsset(fileUrl, mimeType, fileName) {
  const objectUrl = createBinaryAssetBlobUrl(fileUrl, mimeType);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = fileName || 'download';
  document.body.appendChild(link);
  link.click();
  link.remove();

  if (objectUrl.startsWith('blob:')) {
    setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
  }
}

function closeBinaryAssetPreview() {
  const existing = document.getElementById('binary-asset-preview-modal');
  if (existing) {
    const objectUrl = existing.getAttribute('data-object-url') || '';
    if (objectUrl.startsWith('blob:')) {
      URL.revokeObjectURL(objectUrl);
    }
    existing.remove();
  }
}

function showBinaryAssetPreview(fileUrl, mimeType, fileName) {
  closeBinaryAssetPreview();
  const normalizedUrl = normalizeBinaryAssetUrl(fileUrl, mimeType);
  const resolvedMimeType = inferBinaryMimeType(normalizedUrl, mimeType);
  const objectUrl = createBinaryAssetBlobUrl(normalizedUrl, resolvedMimeType);
  const escapedName = String(fileName || 'Document').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const isPdf = resolvedMimeType === 'application/pdf' || normalizedUrl.startsWith('data:application/pdf');
  const isImage = resolvedMimeType.startsWith('image/');
  const canInlinePreview = isPdf || isImage;
  const previewMarkup = isImage
    ? `<img src="${objectUrl}" alt="${escapedName}" class="w-full h-[70vh] object-contain bg-white border border-neutral-200 rounded-xl">`
    : isPdf
      ? `<iframe src="${objectUrl}" class="w-full h-[70vh] bg-white border border-neutral-200 rounded-xl" title="${escapedName} preview"></iframe>`
      : `<div class="py-16 px-6 text-center border border-dashed border-neutral-200 rounded-xl bg-white">
          <p class="text-sm font-black uppercase tracking-widest mb-3">Preview Not Available</p>
          <p class="text-xs text-neutral-500">DOC/DOCX files are stored safely. Use Download when you are ready to open them locally.</p>
        </div>`;

  const modal = document.createElement('div');
  modal.id = 'binary-asset-preview-modal';
  modal.setAttribute('data-object-url', objectUrl);
  modal.innerHTML = `
    <div class="modal-backdrop fixed inset-0 z-[120] flex items-center justify-center p-6">
      <div class="bg-white w-full max-w-5xl p-8 relative animate-in max-h-[92vh] overflow-y-auto rounded-2xl">
        <button onclick="closeBinaryAssetPreview()" class="absolute top-6 right-6" aria-label="Close preview"><i data-lucide="x" size="24"></i></button>
        <div class="mb-6 pr-10">
          <p class="text-[10px] font-black uppercase tracking-[0.24em] text-neutral-400 mb-2">Document Preview</p>
          <h2 class="text-2xl font-black uppercase tracking-tighter">${escapedName}</h2>
          <p class="text-xs text-neutral-500 mt-2">${canInlinePreview ? 'Preview loaded. Download is available below.' : 'This format cannot be previewed inline by the browser.'}</p>
        </div>
        ${previewMarkup}
        <div class="flex items-center gap-3 flex-wrap mt-6">
          <button onclick="downloadBinaryAssetFromPreview()" class="px-5 py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest">Download</button>
          <button onclick="closeBinaryAssetPreview()" class="px-5 py-3 bg-white border border-neutral-300 text-[10px] font-black uppercase tracking-widest">Close</button>
        </div>
      </div>
    </div>`;
  modal.dataset.fileUrl = normalizedUrl;
  modal.dataset.mimeType = resolvedMimeType;
  modal.dataset.fileName = fileName || 'download';
  document.body.appendChild(modal);
  if (window.lucide) {
    lucide.createIcons();
  }
}

function downloadBinaryAssetFromPreview() {
  const modal = document.getElementById('binary-asset-preview-modal');
  if (!modal) {
    return;
  }
  downloadBinaryAsset(modal.dataset.fileUrl || '', modal.dataset.mimeType || '', modal.dataset.fileName || 'download');
}

window.safeReadStorage = safeReadStorage;
window.safeWriteStorage = safeWriteStorage;
window.fetchPortalUpdates = fetchPortalUpdates;
window.createPortalUpdate = createPortalUpdate;
window.fetchOpportunities = fetchOpportunities;
window.fetchRecruiterOpportunities = fetchRecruiterOpportunities;
window.createOpportunity = createOpportunity;
window.fetchApplications = fetchApplications;
window.fetchRecruiterApplications = fetchRecruiterApplications;
window.updateRecruiterApplication = updateRecruiterApplication;
window.fetchStudentApplications = fetchStudentApplications;
window.createApplication = createApplication;
window.fetchStudents = fetchStudents;
window.fetchStudentDocuments = fetchStudentDocuments;
window.saveStudentDocument = saveStudentDocument;
window.inferBranchNameFromEnrollment = inferBranchNameFromEnrollment;
window.mapDocumentsByType = mapDocumentsByType;
window.inferBinaryMimeType = inferBinaryMimeType;
window.normalizeBinaryAssetUrl = normalizeBinaryAssetUrl;
window.createBinaryAssetBlobUrl = createBinaryAssetBlobUrl;
window.openBinaryAsset = openBinaryAsset;
window.downloadBinaryAsset = downloadBinaryAsset;
window.showBinaryAssetPreview = showBinaryAssetPreview;
window.closeBinaryAssetPreview = closeBinaryAssetPreview;
window.downloadBinaryAssetFromPreview = downloadBinaryAssetFromPreview;
