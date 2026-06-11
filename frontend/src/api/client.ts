export interface Keyword {
  id: number;
  text: string;
  created_at: string;
}

export interface SearchResult {
  title: string;
  snippet: string;
  source_url: string;
  published_at: string | null;
  source_domain: string;
  source_type: string;
  credibility_score: number;
}

export interface ProviderInfo {
  search_provider: string;
  summary_provider: string;
  search_max_results: number;
}

export interface SearchRun {
  id: number;
  run_id: number;
  keyword_id: number;
  keyword: string;
  keyword_text: string;
  results: SearchResult[];
  summary: string;
  created_at: string;
  provider_info: ProviderInfo | null;
  warnings: string[];
}

export interface Health {
  status: string;
  database: string;
  search_provider: string;
  summary_provider: string;
}

export interface ProviderStatus {
  search_provider: string;
  summary_provider: string;
  search_key_configured: boolean;
  summary_key_configured: boolean;
  search_max_results: number;
  warnings: string[];
}

const BACKEND_URL_KEY = 'info-radar-api-base-url';
const DEFAULT_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const BACKEND_CONNECTION_MESSAGE =
  '无法连接后端，请确认手机和电脑在同一 Wi-Fi，后端已使用 --host 0.0.0.0 启动，并且 Backend URL 填写的是电脑局域网 IP。';

export function getStoredApiBaseUrl(): string {
  return localStorage.getItem(BACKEND_URL_KEY) || DEFAULT_API_BASE_URL;
}

export function saveApiBaseUrl(url: string): void {
  localStorage.setItem(BACKEND_URL_KEY, normalizeBaseUrl(url));
}

export function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

async function fetchJson<T>(baseUrl: string, path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${normalizeBaseUrl(baseUrl)}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
      ...init,
    });
  } catch {
    throw new Error(BACKEND_CONNECTION_MESSAGE);
  }

  if (!response.ok) {
    let message = `${response.status} ${response.statusText}`;
    try {
      const body = await response.json();
      if (typeof body.detail === 'string') {
        message = body.detail;
      } else if (Array.isArray(body.detail)) {
        message = body.detail
          .map((item: { msg?: string }) => item.msg)
          .filter(Boolean)
          .join('；');
      }
    } catch {
      // Keep the HTTP status message when the backend returns no JSON body.
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function getHealth(baseUrl: string): Promise<Health> {
  return fetchJson<Health>(baseUrl, '/health');
}

export function getProviders(baseUrl: string): Promise<ProviderStatus> {
  return fetchJson<ProviderStatus>(baseUrl, '/providers');
}

export function listKeywords(baseUrl: string): Promise<Keyword[]> {
  return fetchJson<Keyword[]>(baseUrl, '/keywords');
}

export function createKeyword(baseUrl: string, text: string): Promise<Keyword> {
  return fetchJson<Keyword>(baseUrl, '/keywords', {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

export function deleteKeyword(baseUrl: string, keywordId: number): Promise<void> {
  return fetchJson<void>(baseUrl, `/keywords/${keywordId}`, {
    method: 'DELETE',
  });
}

export function runKeyword(baseUrl: string, keywordId: number): Promise<SearchRun> {
  return fetchJson<SearchRun>(baseUrl, `/keywords/${keywordId}/run`, {
    method: 'POST',
  });
}

export function listRuns(baseUrl: string, keywordId: number): Promise<SearchRun[]> {
  return fetchJson<SearchRun[]>(baseUrl, `/keywords/${keywordId}/runs`);
}
