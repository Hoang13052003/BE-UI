/**
 * Utility functions for URL handling to prevent Spring Security Firewall issues
 */

/**
 * Normalizes a base URL by removing trailing slashes
 * This prevents double slash issues when concatenating with paths that start with "/"
 * 
 * @param baseUrl - The base URL to normalize
 * @returns The normalized base URL without trailing slashes
 * 
 * @example
 * normalizeBaseUrl("http://localhost:8080/") => "http://localhost:8080"
 * normalizeBaseUrl("http://localhost:8080") => "http://localhost:8080"
 */
export const normalizeBaseUrl = (baseUrl: string): string => {
  if (!baseUrl) return baseUrl;
  return baseUrl.replace(/\/+$/, '');
};

/**
 * Safely joins a base URL with a path, ensuring no double slashes
 * 
 * @param baseUrl - The base URL
 * @param path - The path to append
 * @returns The properly joined URL
 * 
 * @example
 * joinUrl("http://localhost:8080/", "/api/auth/login") => "http://localhost:8080/api/auth/login"
 * joinUrl("http://localhost:8080", "api/auth/login") => "http://localhost:8080/api/auth/login"
 * joinUrl("http://localhost:8080", "/api/auth/login") => "http://localhost:8080/api/auth/login"
 */
export const joinUrl = (baseUrl: string, path: string): string => {
  const normalizedBase = normalizeBaseUrl(baseUrl);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
};

/**
 * Converts HTTP/HTTPS URLs to WebSocket URLs and normalizes them
 * 
 * @param httpUrl - The HTTP/HTTPS URL to convert
 * @returns The WebSocket URL
 * 
 * @example
 * toWebSocketUrl("http://localhost:8080/") => "ws://localhost:8080"
 * toWebSocketUrl("https://api.example.com/") => "wss://api.example.com"
 */
export const toWebSocketUrl = (httpUrl: string): string => {
  const normalized = normalizeBaseUrl(httpUrl);
  return normalized
    .replace('http://', 'ws://')
    .replace('https://', 'wss://');
};

/**
 * Validates if a URL has double slashes that could cause Spring Security Firewall issues
 * 
 * @param url - The URL to validate
 * @returns true if URL is safe, false if it contains double slashes
 */
export const isUrlSafe = (url: string): boolean => {
  // Check for double slashes after protocol
  const protocolPattern = /^https?:\/\//;
  const urlWithoutProtocol = url.replace(protocolPattern, '');
  return !urlWithoutProtocol.includes('//');
};

/**
 * Fixes URLs that might have double slashes
 * 
 * @param url - The URL to fix
 * @returns The fixed URL
 */
export const fixDoubleSlashes = (url: string): string => {
  // Preserve protocol slashes but fix any other double slashes
  return url.replace(/([^:])\/\/+/g, '$1/');
};

/**
 * Examples and test cases:
 * 
 * normalizeBaseUrl("http://localhost:8080/") => "http://localhost:8080"
 * normalizeBaseUrl("http://localhost:8080") => "http://localhost:8080"
 * 
 * joinUrl("http://localhost:8080/", "/api/auth/login") => "http://localhost:8080/api/auth/login"
 * joinUrl("http://localhost:8080", "api/auth/login") => "http://localhost:8080/api/auth/login"
 * joinUrl("http://localhost:8080", "/api/auth/login") => "http://localhost:8080/api/auth/login"
 * 
 * toWebSocketUrl("http://localhost:8080/") => "ws://localhost:8080"
 * toWebSocketUrl("https://api.example.com/") => "wss://api.example.com"
 * 
 * isUrlSafe("http://localhost:8080/api/auth/login") => true
 * isUrlSafe("http://localhost:8080//api/auth/login") => false
 * 
 * fixDoubleSlashes("http://localhost:8080//api//auth/login") => "http://localhost:8080/api/auth/login"
 */
