import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { ApiService } from './api.service';
import type { PublicUserProfileResponse, UpdateAvatarRequest, UpdateAvatarResponse, UserProfileResponse } from '../models/user.models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiService);

  getMe(): Promise<UserProfileResponse> {
    return firstValueFrom(this.http.get<UserProfileResponse>(this.api.url('/api/users/me')));
  }

  getPublicProfile(userId: string): Promise<PublicUserProfileResponse> {
    return firstValueFrom(this.http.get<PublicUserProfileResponse>(this.api.url(`/api/users/public/${userId}`)));
  }

  updateAvatar(body: UpdateAvatarRequest): Promise<UpdateAvatarResponse> {
    return firstValueFrom(this.http.put<UpdateAvatarResponse>(this.api.url('/api/users/me'), body));
  }
}
