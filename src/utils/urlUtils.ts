export const normalizeBaseUrl = (baseUrl: string): string => {
  if (!baseUrl) return baseUrl;
  return baseUrl.replace(/\/+$/, "");
};

export const joinUrl = (baseUrl: string, path: string): string => {
  const normalizedBase = normalizeBaseUrl(baseUrl);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
};

export const toWebSocketUrl = (httpUrl: string): string => {
  const normalized = normalizeBaseUrl(httpUrl);
  return normalized.replace("http://", "ws://").replace("https://", "wss://");
};

export const isUrlSafe = (url: string): boolean => {
  const protocolPattern = /^https?:\/\//;
  const urlWithoutProtocol = url.replace(protocolPattern, "");
  return !urlWithoutProtocol.includes("//");
};

export const fixDoubleSlashes = (url: string): string => {
  return url.replace(/([^:])\/\/+/g, "$1/");
};
