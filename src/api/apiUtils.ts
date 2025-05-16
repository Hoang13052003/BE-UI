import axiosClient from "./axiosClient";

export interface SortConfig {
  property: string;
  direction: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  items: T[];
  totalItems: number;
  navigationLinks: Record<string, string>;
}

export function parseLinkHeader(header: string): Record<string, string> {
  if (!header) return {};
  const links: Record<string, string> = {};
  header.split(',').forEach(part => {
    const match = part.match(/<([^>]+)>;\s*rel="([^"]+)"/);
    if (match) {
      const [, url, rel] = match;
      links[rel] = url;
    }
  });
  return links;
}

export async function fetchPaginatedData<T>(
  url: string,
  page: number = 0,
  size: number = 10,
  sortConfig?: SortConfig | SortConfig[],
  additionalParams: Record<string, any> = {}
): Promise<PaginatedResult<T>> {
  try {
    let sort: string[] = [];
    if (Array.isArray(sortConfig)) {
      sort = sortConfig.map(s => `${s.property},${s.direction}`);
    } else if (sortConfig) {
      sort = [`${sortConfig.property},${sortConfig.direction}`];
    }

    const response = await axiosClient.get(url, {
      params: {
        page,
        size,
        ...(sort.length > 0 ? { sort } : {}),
        ...additionalParams
      },
      paramsSerializer: (params) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, v));
          } else {
            searchParams.append(key, String(value));
          }
        });
        return searchParams.toString();
      }
    });

    const items = response.data;
    const totalItems = parseInt(response.headers['x-total-count'], 10) || 0;
    const linkHeader = response.headers['link'] || '';
    const navigationLinks = parseLinkHeader(linkHeader);

    return { items, totalItems, navigationLinks };
  } catch (error) {
    console.error(`Error fetching paginated data from ${url}:`, error);
    throw error;
  }
}