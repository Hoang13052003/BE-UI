import axiosClient from "./axiosClient";

export interface ExportReportParams {
  projectId: string;
  startDate?: string;
  endDate?: string;
  reportType: "timesheet" | "project_progress";
  format: "pdf" | "excel" | "csv";
}

export interface ExportReportResponse {
  data: Blob; // Blob type for binary data (e.g., files)
}

const exportReport = async (
  params: ExportReportParams
): Promise<ExportReportResponse> => {
  const response = await axiosClient.get<Blob>(`/reports/export`, {
    params: params,
    responseType: "blob",
  });
  return { data: response.data };
};

const reportApi = { exportReport };

export default reportApi;
