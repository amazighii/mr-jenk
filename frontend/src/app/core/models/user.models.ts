import type { Role } from './role';

export interface UserProfileResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: Role | string;
}

export interface PublicUserProfileResponse {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: Role | string;
}

export interface UpdateAvatarRequest {
  avatarUrl: string;
}

export interface UpdateAvatarResponse {
  message: string;
}
