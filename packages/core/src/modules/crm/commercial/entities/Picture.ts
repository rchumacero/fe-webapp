export class Picture {
  id!: string;
  commercialProductId!: string;
  digitalContentCode!: string;
  order?: number | null;
}

export interface CreatePictureDto {
  commercialProductId: string;
  digitalContentCode: string;
  order?: number | null;
}

export interface UpdatePictureDto extends Partial<CreatePictureDto> {
  id: string;
}
