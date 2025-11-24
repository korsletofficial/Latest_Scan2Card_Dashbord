import axiosInstance from './axios.config';

export interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  profileImage?: string;
  role: {
    _id: string;
    roleName: string;
  };
  companyName?: string;
  twoFactorEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profileImage?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface FeedbackData {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  message: string;
  rating?: number;
  category: 'bug' | 'feature_request' | 'improvement' | 'other';
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
  updatedAt: string;
}

export interface SubmitFeedbackData {
  message: string;
  rating?: number;
  category?: 'bug' | 'feature_request' | 'improvement' | 'other';
}

const profileApi = {
  // Update profile
  updateProfile: async (data: UpdateProfileData) => {
    const response = await axiosInstance.put('/profile', data);
    return response.data.data.user as UserProfile;
  },

  // Change password
  changePassword: async (data: ChangePasswordData) => {
    const response = await axiosInstance.post('/profile/change-password', data);
    return response.data;
  },

  // Toggle 2FA
  toggle2FA: async (enabled: boolean) => {
    const response = await axiosInstance.post('/profile/toggle-2fa', { enabled });
    return response.data.data.user as UserProfile;
  },

  // Submit feedback
  submitFeedback: async (data: SubmitFeedbackData) => {
    const response = await axiosInstance.post('/profile/feedback', data);
    return response.data.data.feedback as FeedbackData;
  },

  // Get feedback history
  getFeedbackHistory: async (page = 1, limit = 10) => {
    const response = await axiosInstance.get('/profile/feedback', {
      params: { page, limit },
    });
    return {
      feedbacks: response.data.data.feedbacks as FeedbackData[],
      pagination: response.data.data.pagination,
    };
  },
};

export default profileApi;
