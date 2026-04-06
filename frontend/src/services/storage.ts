
/**
 * Simulation of a MERN backend.
 * In a real project, these functions would perform fetch() requests 
 * to your Node.js/Express server (e.g., http://localhost:5000/api/suggestions).
 */

import { Suggestion, Category } from '../types';

const API_URL = '/api/suggestions';

const getAuthHeader = () => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    try {
      const { token } = JSON.parse(userInfo);
      return { 'Authorization': `Bearer ${token}` };
    } catch (e) {
      console.error('Error parsing userInfo:', e);
      return {};
    }
  }
  return {};
};

export const getSuggestions = async (): Promise<Suggestion[]> => {
  try {
    const response = await fetch(API_URL, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch suggestions');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return [];
  }
};

export const getPublicSuggestions = async (): Promise<Suggestion[]> => {
  try {
    const response = await fetch(`${API_URL}/public`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch public suggestions');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching public suggestions:', error);
    return [];
  }
};

export const getMySuggestions = async (): Promise<Suggestion[]> => {
  try {
    const response = await fetch(`${API_URL}/me`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch my suggestions');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching my suggestions:', error);
    return [];
  }
};

export const addSuggestion = async (name: string, category: Category, message: string, attachment: File | null = null, visibility: 'public' | 'personal' = 'public'): Promise<Suggestion> => {
  try {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);
    formData.append('message', message);
    formData.append('visibility', visibility);
    if (attachment) {
      formData.append('attachment', attachment);
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        ...getAuthHeader()
      },
      body: formData,
    });

    if (!response.ok) {
      let errMsg = 'Failed to add suggestion';
      try {
        const errData = await response.json();
        errMsg = errData?.details || errData?.error || errData?.message || errMsg;
      } catch (_) {}
      throw new Error(`Upload failed (${response.status}): ${errMsg}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding suggestion:', error);
    throw error;
  }
};

export const deleteSuggestion = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });

    if (!response.ok) {
      throw new Error('Failed to delete suggestion');
    }
  } catch (error) {
    console.error('Error deleting suggestion:', error);
    throw error;
  }
};

export const updateSuggestionStatus = async (id: string, status: string): Promise<Suggestion> => {
  try {
    const response = await fetch(`${API_URL}/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      throw new Error('Failed to update suggestion status');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating suggestion status:', error);
    throw error;
  }
};

export const updateSuggestionReply = async (id: string, adminReply: string): Promise<Suggestion> => {
  try {
    const response = await fetch(`${API_URL}/${id}/reply`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ adminReply })
    });

    if (!response.ok) {
      throw new Error('Failed to update suggestion reply');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating suggestion reply:', error);
    throw error;
  }
};

export const toggleUpvoteSuggestion = async (id: string): Promise<Suggestion> => {
  try {
    const response = await fetch(`${API_URL}/${id}/upvote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });

    if (!response.ok) {
      // If 401 unauthorized, it means the user isn't logged in
      if (response.status === 401) {
        throw new Error('Unauthorized');
      }
      throw new Error('Failed to toggle upvote');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error toggling upvote:', error);
    throw error;
  }
};
