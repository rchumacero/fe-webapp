export interface UserRepository {
  getDistinctUsers(vendorCode?: string): Promise<string[]>;
}
