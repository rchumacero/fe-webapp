import { Profile, CreateProfileDto, UpdateProfileDto } from "../entities/Profile";

export interface ProfileRepository {
    getAll(): Promise<Profile[]>;
    getById(id: string): Promise<Profile>;
    create(data: CreateProfileDto): Promise<Profile>;
    update(data: UpdateProfileDto): Promise<Profile>;
    delete(id: string): Promise<void>;
}
