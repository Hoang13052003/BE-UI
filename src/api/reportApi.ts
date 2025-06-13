import axiosClient from "./axiosClient";

export interface ReportRequestDto {
  to: string;
  subject: string;
  url: string;
}

export const sendReport = async (data: ReportRequestDto): Promise<string> => {
  const response = await axiosClient.post<string>("/api/private/report", data);
  return response.data;
};
