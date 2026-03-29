// This is the backend server address used by the frontend.
// If your backend port changes later, update it here once.
const PLACEPRO_API_BASE = window.PLACEPRO_API_BASE || 'http://localhost:8080';

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
