import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'https://campus-suggestion-box-backend.vercel.app';

const getToken = async (): Promise<string | null> => {
  const userInfo = await AsyncStorage.getItem('userInfo');
  if (userInfo) {
    const { token } = JSON.parse(userInfo);
    return token;
  }
  return null;
};

const authHeader = async () => {
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// AUTH
export const loginUser = async (email: string, password: string, role: string) => {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  return data;
};

export const registerUser = async (name: string, email: string, password: string, role: string) => {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Registration failed');
  return data;
};

export const googleAuth = async (credential: string, role: string) => {
  const res = await fetch(`${API_BASE}/api/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential, role }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Google auth failed');
  return data;
};

// SUGGESTIONS
export const getPublicSuggestions = async () => {
  const res = await fetch(`${API_BASE}/api/suggestions/public`);
  if (!res.ok) throw new Error('Failed to fetch suggestions');
  return res.json();
};

export const getMySuggestions = async () => {
  const headers = await authHeader();
  const res = await fetch(`${API_BASE}/api/suggestions/me`, { headers });
  if (!res.ok) throw new Error('Failed to fetch your suggestions');
  return res.json();
};

export const getAllSuggestions = async () => {
  const headers = await authHeader();
  const res = await fetch(`${API_BASE}/api/suggestions`, { headers } as any);
  if (!res.ok) throw new Error('Failed to fetch all suggestions');
  return res.json();
};

export const submitSuggestion = async (
  name: string,
  category: string,
  message: string,
  visibility: string,
  imageUri?: string | null
) => {
  const headers = await authHeader();
  const formData = new FormData();
  formData.append('name', name);
  formData.append('category', category);
  formData.append('message', message);
  formData.append('visibility', visibility);
  if (imageUri) {
    const filename = imageUri.split('/').pop() || 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    formData.append('attachment', { uri: imageUri, name: filename, type } as any);
  }
  const res = await fetch(`${API_BASE}/api/suggestions`, {
    method: 'POST',
    headers: { ...headers } as any,
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.details || 'Submission failed');
  return data;
};

export const upvoteSuggestion = async (id: string) => {
  const headers = await authHeader();
  const res = await fetch(`${API_BASE}/api/suggestions/${id}/upvote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers } as any,
  });
  if (!res.ok) throw new Error('Failed to upvote');
  return res.json();
};

export const updateStatus = async (id: string, status: string) => {
  const headers = await authHeader();
  const res = await fetch(`${API_BASE}/api/suggestions/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...headers } as any,
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update status');
  return res.json();
};

export const sendReply = async (id: string, adminReply: string) => {
  const headers = await authHeader();
  const res = await fetch(`${API_BASE}/api/suggestions/${id}/reply`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...headers } as any,
    body: JSON.stringify({ adminReply }),
  });
  if (!res.ok) throw new Error('Failed to send reply');
  return res.json();
};

export const deleteSuggestion = async (id: string) => {
  const headers = await authHeader();
  const res = await fetch(`${API_BASE}/api/suggestions/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...headers } as any,
  });
  if (!res.ok) throw new Error('Failed to delete');
};
