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

async function createOpportunity(payload) {
  return placeProApi('/api/opportunities', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

async function fetchApplications() {
  return placeProApi('/api/applications');
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

window.safeReadStorage = safeReadStorage;
window.safeWriteStorage = safeWriteStorage;
window.fetchPortalUpdates = fetchPortalUpdates;
window.createPortalUpdate = createPortalUpdate;
window.fetchOpportunities = fetchOpportunities;
window.createOpportunity = createOpportunity;
window.fetchApplications = fetchApplications;
window.fetchStudentApplications = fetchStudentApplications;
window.createApplication = createApplication;
window.fetchStudents = fetchStudents;
window.fetchStudentDocuments = fetchStudentDocuments;
window.saveStudentDocument = saveStudentDocument;
window.inferBranchNameFromEnrollment = inferBranchNameFromEnrollment;
window.mapDocumentsByType = mapDocumentsByType;
