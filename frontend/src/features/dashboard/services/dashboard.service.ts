import api from "@/services/api";

export interface DashboardParams {
  start_date?: string;
  end_date?: string;
  game_id?: string;
}

export const dashboardService = {
  /**
   * [STATIC] Dữ liệu nặng: KPIs, biểu đồ, quick stats.
   * Backend cache 5 phút → Frontend staleTime 5 phút.
   */
  getOverview: async (params?: DashboardParams) => {
    const response = await api.get("/admin/dashboard/overview/", { params });
    return response.data?.data ?? response.data;
  },

  /**
   * [DYNAMIC] Dữ liệu real-time: đơn hàng mới nhất, online users.
   * Backend cache 30 giây → Frontend refetch mỗi 30s.
   */
  getLive: async () => {
    const response = await api.get("/admin/dashboard/live/");
    return response.data?.data ?? response.data;
  },

  /**
   * Xuất báo cáo dạng Blob → trình duyệt tự tải file về.
   */
  exportReport: async (format: "excel" | "pdf", params?: DashboardParams) => {
    const response = await api.get("/admin/dashboard/export/", {
      params: { file_format: format, ...params },
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `dashboard_report.${format === "excel" ? "xlsx" : "pdf"}`
    );
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
