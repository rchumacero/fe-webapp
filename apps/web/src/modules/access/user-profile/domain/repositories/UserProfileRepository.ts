import { UserProfile, CreateUserProfileDto, UpdateUserProfileDto } from "../entities/UserProfile";

export interface UserProfileRepository {
  getAll(): Promise<UserProfile[]>;
  getById(id: string): Promise<UserProfile>;
  create(data: CreateUserProfileDto): Promise<UserProfile>;
  update(id: string, data: UpdateUserProfileDto): Promise<UserProfile>;
  delete(id: string): Promise<void>;
}
