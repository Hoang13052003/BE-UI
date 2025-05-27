// File: src/api/apiUtils.ts

import axiosClient from "./axiosClient";
import { ApiPage, PageableInfo, SortInfo } from '../types/project';

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
      sort = sortConfig.map(sCfg => `${sCfg.property},${sCfg.direction}`); // sCfg là tham số của map
    } else if (sortConfig) { 
      sort = [`${sortConfig.property},${sortConfig.direction}`]; // Dùng sortConfig trực tiếp
    }

    const paramsForOldApi = { page, size, ...(sort.length > 0 ? { sort } : {}), ...additionalParams };
    const response = await axiosClient.get(url, {
      params: paramsForOldApi,
      paramsSerializer: (params) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (Array.isArray(value)) { value.forEach(v => searchParams.append(key, v)); } 
          else if (value !== undefined && value !== null) { searchParams.append(key, String(value)); }
        });
        return searchParams.toString();
      }
    });
    const items = response.data?.content || response.data || [];
    const totalItems = response.data?.totalElements !== undefined ? response.data.totalElements : (parseInt(response.headers['x-total-count'], 10) || 0);
    const linkHeader = response.headers['link'] || '';
    const navigationLinks = parseLinkHeader(linkHeader);
    return { items, totalItems, navigationLinks };
  } catch (error) {
    console.error(`Error fetching paginated data (legacy) from ${url}:`, error);
    return { items: [], totalItems: 0, navigationLinks: {} };
  }
}

export async function fetchSpringPageData<T>(
  url: string,
  page: number = 0,
  size: number = 10,
  sortConfig?: SortConfig | SortConfig[],
  additionalParams: Record<string, any> = {}
): Promise<ApiPage<T>> {
  try {
    let sortParams: string[] = [];
    if (Array.isArray(sortConfig)) {
      // Khi sortConfig là một mảng, chúng ta dùng map và tham số của hàm map (ở đây là sCfg)
      sortParams = sortConfig.map(sCfg => `${sCfg.property},${sCfg.direction}`);
    } else if (sortConfig) { 
      // Khi sortConfig là một object SortConfig đơn lẻ (không phải mảng),
      // chúng ta truy cập trực tiếp các thuộc tính của object sortConfig đó.
      sortParams = [`${sortConfig.property},${sortConfig.direction}`]; // << SỬA LẠI Ở ĐÂY
    }

    const response = await axiosClient.get(url, {
      params: {
        page,
        size,
        ...(sortParams.length > 0 ? { sort: sortParams } : {}),
        ...additionalParams
      },
      paramsSerializer: (params) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, v));
          } else if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
          }
        });
        return searchParams.toString();
      }
    });

    const springPageData = response.data;

    if (typeof springPageData !== 'object' || springPageData === null || !('content' in springPageData && Array.isArray(springPageData.content)) || typeof springPageData.totalElements !== 'number' || typeof springPageData.totalPages !== 'number' || typeof springPageData.number !== 'number') {
      console.error("fetchSpringPageData: Invalid Spring Page data structure from API for URL:", url, springPageData);
      const defaultSortInfo: SortInfo = { sorted: false, unsorted: true, empty: true };
      const defaultPageable: PageableInfo = { pageNumber: page, pageSize: size, offset: page * size, paged: true, unpaged: false, sort: defaultSortInfo };
      return { content: [], pageable: defaultPageable, last: true, totalPages: 0, totalElements: 0, size: size, number: page, sort: defaultSortInfo, first: true, numberOfElements: 0, empty: true } as ApiPage<T>;
    }
    const apiPageResult: ApiPage<T> = {
      content: springPageData.content,
      pageable: { sort: springPageData.pageable?.sort || springPageData.sort || { sorted: false, unsorted: true, empty: true }, offset: springPageData.pageable?.offset ?? springPageData.number * springPageData.size, pageNumber: springPageData.pageable?.pageNumber ?? springPageData.number, pageSize: springPageData.pageable?.pageSize ?? springPageData.size, paged: springPageData.pageable?.paged ?? true, unpaged: springPageData.pageable?.unpaged ?? false, },
      last: springPageData.last ?? true, totalPages: springPageData.totalPages, totalElements: springPageData.totalElements, size: springPageData.size ?? size, number: springPageData.number, sort: springPageData.sort || { sorted: false, unsorted: true, empty: true }, first: springPageData.first ?? true, numberOfElements: springPageData.numberOfElements ?? 0, empty: springPageData.empty ?? true,
    };
    return apiPageResult;

  } catch (error) {
    console.error(`Error fetching Spring Page data from ${url}:`, error);
    const defaultSortInfo: SortInfo = { sorted: false, unsorted: true, empty: true };
    const defaultPageable: PageableInfo = { pageNumber: page, pageSize: size, offset: page * size, paged: true, unpaged: false, sort: defaultSortInfo };
    return { content: [], pageable: defaultPageable, last: true, totalPages: 0, totalElements: 0, size: size, number: page, sort: defaultSortInfo, first: true, numberOfElements: 0, empty: true } as ApiPage<T>;
  }
}