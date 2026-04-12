import axios, { AxiosInstance } from 'axios';
import { toast } from 'sonner';
import { API_CONFIG, API_ENDPOINTS } from '../constants/api';
import { LOCAL_STORAGE_KEYS } from '../constants/app';

export interface BlogAdminItem {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  tags?: string[];
  author?: string;
  isPublished: boolean;
  publishedAt?: string;
  views: number;
  createdAt?: string;
}

export interface BlogListResponse {
  items: BlogAdminItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class BlogsAdminService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
    });

    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem(LOCAL_STORAGE_KEYS.ADMIN_TOKEN);
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        const message = error.response?.data?.message || 'Request failed';
        toast.error(Array.isArray(message) ? message[0] : message);
        return Promise.reject(error);
      }
    );
  }

  async list(page = 1, limit = 20, search?: string): Promise<BlogListResponse> {
    const { data } = await this.api.get(API_ENDPOINTS.BLOGS.LIST, { params: { page, limit, search } });
    return data;
  }

  async create(payload: Partial<BlogAdminItem>): Promise<BlogAdminItem> {
    const { data } = await this.api.post(API_ENDPOINTS.BLOGS.CREATE, payload);
    toast.success('Blog created');
    return data;
  }

  async update(id: string, payload: Partial<BlogAdminItem>): Promise<BlogAdminItem> {
    const { data } = await this.api.put(API_ENDPOINTS.BLOGS.UPDATE(id), payload);
    toast.success('Blog updated');
    return data;
  }

  async remove(id: string): Promise<void> {
    await this.api.delete(API_ENDPOINTS.BLOGS.DELETE(id));
    toast.success('Blog deleted');
  }
}

export const blogsAdminService = new BlogsAdminService();
