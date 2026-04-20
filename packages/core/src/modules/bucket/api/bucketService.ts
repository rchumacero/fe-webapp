import { createApiClient } from '@kplian/infrastructure';

const bucketApi = createApiClient('bucket');

export interface UploadParams {
  file: File;
  moduleCode: string;
  entityName: string;
  entityId: string | number;
  bucketName?: string;
  securityLevelCode?: 'PUBLIC' | 'PRIVATE' | 'PROTECTED';
}

export const bucketService = {
  uploadFile: async (params: UploadParams) => {
    const formData = new FormData();
    formData.append('file', params.file);
    formData.append('moduleCode', params.moduleCode);
    formData.append('entityName', params.entityName);
    formData.append('entityId', params.entityId.toString());
    formData.append('bucketName', params.bucketName || 'crm');
    formData.append('securityLevelCode', params.securityLevelCode || 'PUBLIC');

    const response = await bucketApi.post('/v1/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  getPresignedUrl: async (digitalContentCode: string) => {
    const response = await bucketApi.get(`/v1/files/${digitalContentCode}/presigned-url`);
    // response.data is expected to be an array [{ url: '...', type: '...' }, ...]
    return response.data;
  },

  getPresignedUrlsBatch: async (ids: string[]) => {
    const response = await bucketApi.post('/v1/files/presigned-urls-batch', { ids });
    // response.data is expected to be [{ id: "...", presignedUrl: "..." }]
    return response.data;
  },
};
