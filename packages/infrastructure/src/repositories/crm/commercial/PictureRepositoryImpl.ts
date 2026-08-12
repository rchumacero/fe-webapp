import { createApiClient } from "../../../api/client";
import { 
  Picture, 
  CreatePictureDto, 
  UpdatePictureDto,
  IPictureRepository 
} from "@kplian/core";

export const PICTURE_API_ROUTES = {
  PICTURE: '/v1/pictures',
  PICTURE_UPDATE: (id: string | number) => `/v1/pictures/${id}`,
  PICTURE_DELETE: (id: string | number) => `/v1/pictures/${id}`,
  PICTURE_BY_ID: (id: string | number) => `/v1/pictures/${id}`,
};

export class PictureRepositoryImpl implements IPictureRepository {
  private api = createApiClient('crm');

  async getAll(): Promise<Picture[]> {
    const response = await this.api.get<Picture[]>(
      PICTURE_API_ROUTES.PICTURE
    );
    return response.data || [];
  }

  async getById(id: string): Promise<Picture> {
    const response = await this.api.get<Picture>(
      PICTURE_API_ROUTES.PICTURE_BY_ID(id)
    );
    return response.data;
  }

  async create(data: CreatePictureDto): Promise<Picture> {
    const response = await this.api.post<Picture>(
      PICTURE_API_ROUTES.PICTURE,
      data
    );
    return response.data;
  }

  async update(data: UpdatePictureDto): Promise<Picture> {
    const response = await this.api.put<Picture>(
      PICTURE_API_ROUTES.PICTURE_UPDATE(data.id),
      data
    );
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(
      PICTURE_API_ROUTES.PICTURE_DELETE(id)
    );
  }
}
