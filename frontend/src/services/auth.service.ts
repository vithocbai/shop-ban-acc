import api from './api';

export const authService = {
  /**
   * Đăng nhập lấy token
   */
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login/', { email, password });
    const { access, refresh } = response.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    return response.data;
  },

  /**
   * Đăng ký
   */
  register: async (username: string, email: string, password: string, confirmPassword: string) => {
    const response = await api.post('/auth/register/', { username, email, password, confirm_password: confirmPassword });
    return response.data;
  },
  
  /**
   * Đăng xuất xóa token
   */
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/admin/login';
  },

  /**
   * Lấy thông tin người dùng đang đăng nhập
   */
  getMe: async () => {
    const response = await api.get('/auth/me/');
    return response.data;
  }
};
