import { apiClient } from './axios.config';

export interface SingleTrendData {
  date: string;
  count: number;
}

export interface SingleTrendResponse {
  success: boolean;
  message: string;
  data: {
    trends: SingleTrendData[];
  };
}

export interface DashboardStats {
  totalExhibitors: number;
  activeEvents: number;
  totalLeads: number;
  activeUsers: number;
}

export interface DashboardStatsResponse {
  success: boolean;
  message: string;
  data: DashboardStats;
}

export const adminAPI = {
  getDashboardStats: async (): Promise<DashboardStatsResponse> => {
    try {
      const response = await apiClient.get('/admin/dashboard/stats');
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Failed to fetch dashboard stats');
      }
      throw error;
    }
  },

  getEventsTrend: async (days = 7): Promise<SingleTrendResponse> => {
    try {
      const response = await apiClient.get('/admin/dashboard/trends/events', {
        params: { days },
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Failed to fetch events trend');
      }
      throw error;
    }
  },

  getLeadsTrend: async (days = 7): Promise<SingleTrendResponse> => {
    try {
      const response = await apiClient.get('/admin/dashboard/trends/leads', {
        params: { days },
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Failed to fetch leads trend');
      }
      throw error;
    }
  },

  getLicenseKeysTrend: async (days = 7): Promise<SingleTrendResponse> => {
    try {
      const response = await apiClient.get('/admin/dashboard/trends/keys', {
        params: { days },
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Failed to fetch license keys trend');
      }
      throw error;
    }
  },
};

