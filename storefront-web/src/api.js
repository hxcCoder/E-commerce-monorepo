const API_STORAGE_KEY = 'commerceflow.apiBase.v1';
const TOKEN_STORAGE_KEY = 'commerceflow.jwt.v1';

function buildHeaders(token) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function withTimeout(ms = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { controller, timer };
}

export function getApiBase() {
  return localStorage.getItem(API_STORAGE_KEY) || 'http://localhost:3000';
}

export function setApiBase(base) {
  localStorage.setItem(API_STORAGE_KEY, base);
}

export function getToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY) || '';
}

export function setToken(token) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export async function createAndStartOrder({ baseUrl, token, payload }) {
  const { controller, timer } = withTimeout();

  try {
    const processResponse = await fetch(`${baseUrl}/api/processes`, {
      method: 'POST',
      headers: buildHeaders(token),
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const processData = await processResponse.json().catch(() => ({}));

    if (!processResponse.ok) {
      throw new Error(processData.error || `Create process failed (${processResponse.status})`);
    }

    const executionResponse = await fetch(`${baseUrl}/api/processes/start-execution`, {
      method: 'POST',
      headers: buildHeaders(token),
      body: JSON.stringify({ processId: processData.id, userId: payload.userId }),
      signal: controller.signal,
    });

    const executionData = await executionResponse.json().catch(() => ({}));

    if (!executionResponse.ok) {
      throw new Error(executionData.error || `Start execution failed (${executionResponse.status})`);
    }

    return {
      process: processData,
      execution: executionData,
      requestId:
        executionResponse.headers.get('x-request-id') || processResponse.headers.get('x-request-id') || null,
    };
  } finally {
    clearTimeout(timer);
  }
}
