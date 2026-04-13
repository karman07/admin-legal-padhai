import axios, { AxiosInstance } from 'axios';
import { toast } from 'sonner';
import { API_CONFIG, API_ENDPOINTS } from '../constants/api';
import { LOCAL_STORAGE_KEYS } from '../constants/app';
import type {
  AudioLesson,
  PDF,
  PaginatedAudioResponse,
  PaginatedPDFResponse,
  Category,
  StudyMaterialCategory,
  PaginatedResourcesResponse,
  ResourceItem,
  PaginatedAudioSectionsResponse,
  PaginatedAudioSubsectionsResponse,
} from '../types/media';

class MediaService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: 60000,
    });

    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem(LOCAL_STORAGE_KEYS.ADMIN_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        const message = error.response?.data?.message || 'Request failed';
        toast.error(message);
        return Promise.reject(error);
      }
    );
  }

  // Audio APIs
  async uploadAudio(formData: FormData): Promise<AudioLesson> {
    const { data } = await this.api.post('/admin/audio-lessons', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    toast.success('Audio uploaded successfully');
    return data;
  }

  async listAudio(params?: { page?: number; limit?: number; category?: string; isActive?: string; search?: string }): Promise<PaginatedAudioResponse> {
    const normalizedParams = {
      page: params?.page,
      limit: params?.limit,
      category: params?.category,
      isActive: params?.isActive,
      search: params?.search,
    };
    const { data } = await this.api.get('/admin/audio-lessons', { params: normalizedParams });
    return {
      audioLessons: data.audioLessons || data.items || [],
      pagination: {
        page: data.pagination?.page ?? data.page ?? (normalizedParams.page ?? 1),
        limit: data.pagination?.limit ?? data.limit ?? (normalizedParams.limit ?? 10),
        total: data.pagination?.total ?? data.total ?? 0,
        totalPages: data.pagination?.totalPages ?? data.totalPages ?? 0,
      },
    };
  }

  async getAudioById(id: string): Promise<AudioLesson> {
    const { data } = await this.api.get(`/admin/audio-lessons/${id}`);
    return data;
  }

  async getAudioByIdFull(id: string): Promise<AudioLesson> {
    const { data } = await this.api.get(`/admin/audio-lessons/${id}/full`);
    return data;
  }

  async getAdminAudioSectionFull(id: string, sectionIndex: number): Promise<any> {
    const { data } = await this.api.get(`/admin/audio-lessons/${id}/sections/${sectionIndex}/full`);
    return data;
  }

  async updateAdminAudioSection(id: string, sectionIndex: number, formData: FormData): Promise<any> {
    const { data } = await this.api.put(`/admin/audio-lessons/${id}/sections/${sectionIndex}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    toast.success(`Section ${sectionIndex + 1} updated successfully`);
    return data;
  }

  async listAudioSections(id: string, page = 1, limit = 20): Promise<PaginatedAudioSectionsResponse> {
    const { data } = await this.api.get(`/audio-lessons/${id}/sections`, { params: { page, limit } });
    return data;
  }

  async getAudioSectionDetail(id: string, sectionIndex: number): Promise<any> {
    const { data } = await this.api.get(`/audio-lessons/${id}/sections/${sectionIndex}`);
    return data;
  }

  async listAudioSubsections(id: string, sectionIndex: number, page = 1, limit = 25): Promise<PaginatedAudioSubsectionsResponse> {
    const { data } = await this.api.get(`/audio-lessons/${id}/sections/${sectionIndex}/subsections`, {
      params: { page, limit },
    });
    return data;
  }

  async getAudioSubsectionDetail(id: string, sectionIndex: number, subsectionIndex: number): Promise<any> {
    const { data } = await this.api.get(`/audio-lessons/${id}/sections/${sectionIndex}/subsections/${subsectionIndex}`);
    return data;
  }

  async updateAudio(id: string, formData: FormData): Promise<AudioLesson> {
    const { data } = await this.api.put(`/admin/audio-lessons/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    toast.success('Audio updated successfully');
    return data;
  }

  async deleteAudio(id: string): Promise<void> {
    await this.api.delete(`/admin/audio-lessons/${id}`);
    toast.success('Audio deleted successfully');
  }

  async updateSections(id: string, sections: any[]): Promise<AudioLesson> {
    const { data } = await this.api.put(`/admin/audio-lessons/${id}/sections`, { sections });
    toast.success('Sections updated successfully');
    return data;
  }

  async getCategories(): Promise<Category[]> {
    try {
      const { data } = await this.api.get('/admin/audio-lessons/categories');
      return data.categories || data;
    } catch {
      return [];
    }
  }

  // PDF APIs
  async uploadPDF(formData: FormData): Promise<PDF> {
    const { data } = await this.api.post('/admin/pdfs', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    toast.success('PDF uploaded successfully');
    return data;
  }

  async listPDFs(params?: { page?: number; limit?: number; isActive?: boolean; search?: string; category?: string; year?: number }): Promise<PaginatedPDFResponse> {
    const { data } = await this.api.get('/admin/pdfs', { params });
    return {
      pdfs: data.pdfs || data.items || [],
      pagination: {
        page: data.pagination?.page ?? data.page ?? (params?.page ?? 1),
        limit: data.pagination?.limit ?? data.limit ?? (params?.limit ?? 10),
        total: data.pagination?.total ?? data.total ?? 0,
        totalPages: data.pagination?.totalPages ?? data.totalPages ?? 0,
      },
    };
  }

  async getPDFById(id: string): Promise<PDF> {
    const { data } = await this.api.get(`/admin/pdfs/${id}`);
    return data;
  }

  async updatePDF(id: string, formData: FormData): Promise<PDF> {
    const { data } = await this.api.put(`/admin/pdfs/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    toast.success('PDF updated successfully');
    return data;
  }

  async deletePDF(id: string): Promise<void> {
    await this.api.delete(`/admin/pdfs/${id}`);
    toast.success('PDF deleted successfully');
  }

  // Resource APIs
  async createResource(formData: FormData): Promise<ResourceItem> {
    const { data } = await this.api.post(API_ENDPOINTS.RESOURCES.CREATE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    toast.success('Resource created successfully');
    return data;
  }

  async listResources(params?: {
    page?: number;
    limit?: number;
    search?: string;
    fileType?: 'pdf' | 'md';
    category?: string;
    isActive?: string;
    kind?: 'resource' | 'study-material';
  }): Promise<PaginatedResourcesResponse> {
    const { data } = await this.api.get(API_ENDPOINTS.RESOURCES.LIST, { params });
    return data;
  }

  async updateResource(id: string, formData: FormData): Promise<ResourceItem> {
    const { data } = await this.api.put(API_ENDPOINTS.RESOURCES.UPDATE(id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    toast.success('Resource updated successfully');
    return data;
  }

  async deleteResource(id: string): Promise<void> {
    await this.api.delete(API_ENDPOINTS.RESOURCES.DELETE(id));
    toast.success('Resource deleted successfully');
  }

  async listResourceCategories(): Promise<StudyMaterialCategory[]> {
    const { data } = await this.api.get(API_ENDPOINTS.RESOURCES.CATEGORIES, {
      params: { kind: 'resource' },
    });
    return data || [];
  }

  async listContentCategories(kind: 'resource' | 'study-material'): Promise<StudyMaterialCategory[]> {
    const { data } = await this.api.get(API_ENDPOINTS.RESOURCES.CATEGORIES, { params: { kind } });
    return data || [];
  }

  async createResourceCategory(name: string): Promise<StudyMaterialCategory> {
    const { data } = await this.api.post(API_ENDPOINTS.RESOURCES.CATEGORIES, { name, kind: 'resource' });
    toast.success('Category created successfully');
    return data;
  }

  async createContentCategory(name: string, kind: 'resource' | 'study-material'): Promise<StudyMaterialCategory> {
    const { data } = await this.api.post(API_ENDPOINTS.RESOURCES.CATEGORIES, { name, kind });
    toast.success('Category created successfully');
    return data;
  }

  async updateResourceCategory(id: string, name: string): Promise<StudyMaterialCategory> {
    const { data } = await this.api.put(API_ENDPOINTS.RESOURCES.CATEGORY_BY_ID(id), { name, kind: 'resource' });
    toast.success('Category updated successfully');
    return data;
  }

  async updateContentCategory(id: string, name: string, kind: 'resource' | 'study-material'): Promise<StudyMaterialCategory> {
    const { data } = await this.api.put(API_ENDPOINTS.RESOURCES.CATEGORY_BY_ID(id), { name, kind });
    toast.success('Category updated successfully');
    return data;
  }

  async deleteResourceCategory(id: string): Promise<void> {
    await this.api.delete(API_ENDPOINTS.RESOURCES.CATEGORY_BY_ID(id), {
      params: { kind: 'resource' },
    });
    toast.success('Category deleted successfully');
  }

  async deleteContentCategory(id: string, kind: 'resource' | 'study-material'): Promise<void> {
    await this.api.delete(API_ENDPOINTS.RESOURCES.CATEGORY_BY_ID(id), {
      params: { kind },
    });
    toast.success('Category deleted successfully');
  }
}

export const mediaService = new MediaService();
