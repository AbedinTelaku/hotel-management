// Token Management Utilities
export const setToken = (token: string) => {
  localStorage.setItem('authToken', token);
  console.log('✅ Token set in localStorage');
  console.log('Token preview:', token.substring(0, 50) + '...');
};

export const getToken = (): string | null => {
  return localStorage.getItem('authToken');
};

export const clearToken = () => {
  localStorage.removeItem('authToken');
  console.log('🗑️ Token cleared from localStorage');
};

export const hasToken = (): boolean => {
  const token = localStorage.getItem('authToken');
  return !!token;
};

export const getTokenPreview = (): string => {
  const token = localStorage.getItem('authToken');
  if (!token) return 'No token';
  return token.substring(0, 50) + '...';
};
