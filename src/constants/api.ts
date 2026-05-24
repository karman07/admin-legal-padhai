/**
 * API Configuration Constants
 * LegalPadhai Admin Panel
 */

const _rawUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined) || 'https://api.legalpadhai.ai';
// Ensure the base URL always ends with /api regardless of how the env var is set
const _baseUrl = _rawUrl.replace(/\/api$/, '') + '/api';

export const API_CONFIG = {
  BASE_URL: _baseUrl,
  TIMEOUT: 30000,
} as const;

export const API_ENDPOINTS = {
  // Admin Authentication
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
  },
  
  // Admin User Management
  ADMIN: {
    USERS: '/admin/users',
    USER_BY_ID: (userId: string) => `/admin/users/${userId}`,
    USER_SEARCH: '/admin/users/search',
    USER_STATS: '/admin/users/stats',
    SYSTEM_OVERVIEW: '/admin/system/overview',
    USER_PASSWORD: (userId: string) => `/admin/users/${userId}/password`,
    USER_VERIFY: (userId: string) => `/admin/users/${userId}/verify`,
    USER_ROLE: (userId: string) => `/admin/users/${userId}/role`,
    USER_TOGGLE_STATUS: (userId: string) => `/admin/users/${userId}/toggle-status`,
  },
  
  // Admin Quiz Management
  QUIZZES: {
    LIST: '/admin/quizzes',
    CREATE: '/admin/quizzes',
    BY_ID: (quizId: string) => `/admin/quizzes/${quizId}`,
    UPDATE: (quizId: string) => `/admin/quizzes/${quizId}`,
    DELETE: (quizId: string) => `/admin/quizzes/${quizId}`,
  },

  BLOGS: {
    LIST: '/admin/blogs',
    CREATE: '/admin/blogs',
    BY_ID: (blogId: string) => `/admin/blogs/${blogId}`,
    UPDATE: (blogId: string) => `/admin/blogs/${blogId}`,
    DELETE: (blogId: string) => `/admin/blogs/${blogId}`,
  },

  RESOURCES: {
    LIST: '/admin/resources',
    CREATE: '/admin/resources',
    BY_ID: (resourceId: string) => `/admin/resources/${resourceId}`,
    UPDATE: (resourceId: string) => `/admin/resources/${resourceId}`,
    DELETE: (resourceId: string) => `/admin/resources/${resourceId}`,
    CATEGORIES: '/admin/resources/categories',
    CATEGORY_BY_ID: (categoryId: string) => `/admin/resources/categories/${categoryId}`,
  },
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;
