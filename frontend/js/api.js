// This is the backend server address used by the frontend.
// If your backend port changes later, update it here once.
const PLACEPRO_API_BASE = window.PLACEPRO_API_BASE || 'http://localhost:8080';

function getPlaceProSession() {
  try {
    const raw = localStorage.getItem('placeProSession');
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function setPlaceProSession(session) {
  if (!session) {
    clearPlaceProSession();
    return;
  }

  localStorage.setItem('placeProSession', JSON.stringify(session));
  localStorage.setItem('loggedInUser', session.name || '');
}

function clearPlaceProSession() {
  localStorage.removeItem('placeProSession');
  localStorage.removeItem('loggedInUser');
}

function redirectToDashboardByRole(role) {
  const normalizedRole = String(role || '').trim().toLowerCase();

  if (normalizedRole === 'student') {
    window.location.href = 'student.html';
    return true;
  }

  if (normalizedRole === 'admin') {
    window.location.href = 'admin.html';
    return true;
  }

  if (normalizedRole === 'recruiter') {
    window.location.href = 'recruiter.html';
    return true;
  }

  return false;
}

function requireRoleSession(expectedRole) {
  const session = getPlaceProSession();
  const normalizedExpectedRole = String(expectedRole || '').trim().toLowerCase();
  const normalizedSessionRole = String(session?.role || '').trim().toLowerCase();

  if (!session || normalizedSessionRole !== normalizedExpectedRole) {
    clearPlaceProSession();
    window.location.href = 'login.html';
    return null;
  }

  return session;
}

async function placeProApi(path, options = {}) {
  // Combine the backend base URL with the API path we pass in.
  // Example: "/api/login" becomes "http://localhost:8080/api/login".
  const response = await fetch(`${PLACEPRO_API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  // Some backend responses come as JSON and some may come as plain text.
  // This block handles both formats safely.
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    // Convert backend error responses into a normal JavaScript Error
    // so pages can show alert(error.message).
    const message = typeof data === 'string'
      ? data
      : (data.message || data.reason || data.error || 'Request failed');
    throw new Error(message);
  }

  // Return the parsed success response back to the page that called this helper.
  return data;
}

window.PLACEPRO_API_BASE = PLACEPRO_API_BASE;
window.placeProApi = placeProApi;
window.getPlaceProSession = getPlaceProSession;
window.setPlaceProSession = setPlaceProSession;
window.clearPlaceProSession = clearPlaceProSession;
window.redirectToDashboardByRole = redirectToDashboardByRole;
window.requireRoleSession = requireRoleSession;
