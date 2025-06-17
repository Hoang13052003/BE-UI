import axiosClient from "./axiosClient";
import { ApiPage } from "../types/project";

export const getProjectUpdateHistoryById = async (
  id: string,
  page: number = 0,
  size: number = 10
): Promise<ApiPage<any>> => {
  try {
    const result = await axiosClient.get<ApiPage<any>>(
      "/api/projects/project-update-history",
      {
        params: {
          id,
          page,
          size,
        },
      }
    );
    return result.data;
  } catch (error) {
    const defaultSortInfo = { sorted: false, unsorted: true, empty: true };
    const defaultPageable = {
      pageNumber: 0,
      pageSize: 10,
      offset: 0,
      paged: true,
      unpaged: false,
      sort: defaultSortInfo,
    };
    return {
      content: [],
      pageable: defaultPageable,
      last: true,
      totalPages: 0,
      totalElements: 0,
      size: 10,
      number: 0,
      sort: defaultSortInfo,
      first: true,
      numberOfElements: 0,
      empty: true,
    } as ApiPage<any>;
  }
};
