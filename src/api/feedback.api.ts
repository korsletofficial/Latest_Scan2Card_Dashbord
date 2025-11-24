import axiosInstance from './axios.config';

export interface FeedbackData {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    companyName?: string;
    role?: {
      _id: string;
      roleName: string;
    };
  };
  message: string;
  rating?: number;
  category: 'bug' | 'feature_request' | 'improvement' | 'other';
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackStats {
  total: number;
  pending: number;
  reviewed: number;
  resolved: number;
  byCategory: {
    bug?: number;
    feature_request?: number;
    improvement?: number;
    other?: number;
  };
}

export interface GetFeedbackParams {
  page?: number;
  limit?: number;
  status?: 'pending' | 'reviewed' | 'resolved';
  category?: 'bug' | 'feature_request' | 'improvement' | 'other';
}

const feedbackApi = {
  // Get all feedback (Admin only)
  getAll: async (params?: GetFeedbackParams) => {
    const response = await axiosInstance.get('/feedback', { params });
    return {
      feedbacks: response.data.data.feedbacks as FeedbackData[],
      pagination: response.data.data.pagination,
    };
  },

  // Get feedback statistics
  getStats: async () => {
    const response = await axiosInstance.get('/feedback/stats');
    return response.data.data as FeedbackStats;
  },

  // Update feedback status
  updateStatus: async (id: string, status: 'pending' | 'reviewed' | 'resolved') => {
    const response = await axiosInstance.put(`/feedback/${id}/status`, { status });
    return response.data.data.feedback as FeedbackData;
  },
};

export default feedbackApi;
