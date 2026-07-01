import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpRequest } from '@angular/common/http';
import { filter, firstValueFrom, map, Observable } from 'rxjs';

import { ApiService } from './api.service';
import type { MediaItem, MediaWrapperResponse, UpdateMediaResponse } from '../models/media.models';

export interface UploadProgress<T> {
  state: 'progress' | 'done';
  progress?: number;
  data?: T;
}

@Injectable({ providedIn: 'root' })
export class MediaService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiService);

  uploadProductImages(files: File[]): Observable<UploadProgress<MediaItem[]>> {
    const form = new FormData();
    for (const file of files) form.append('file', file);

    const req = new HttpRequest('POST', this.api.url('/api/media/images'), form, {
      reportProgress: true,
    });

    return this.http.request<MediaWrapperResponse>(req).pipe(
      map((event: HttpEvent<MediaWrapperResponse>): UploadProgress<MediaItem[]> => {
        if (event.type === HttpEventType.UploadProgress) {
          const total = event.total ?? 0;
          const progress = total ? Math.round((100 * event.loaded) / total) : 0;
          return { state: 'progress', progress };
        }
        if (event.type === HttpEventType.Response) {
          return { state: 'done', data: event.body?.response ?? [] };
        }
        return { state: 'progress', progress: 0 };
      }),
      filter((v) => v.state === 'progress' || v.state === 'done'),
    );
  }

  uploadProfileImage(file: File): Observable<UploadProgress<MediaItem>> {
    const form = new FormData();
    form.append('file', file);

    const req = new HttpRequest('POST', this.api.url('/api/media/images/profile'), form, {
      reportProgress: true,
    });

    return this.http.request<MediaWrapperResponse>(req).pipe(
      map((event: HttpEvent<MediaWrapperResponse>): UploadProgress<MediaItem> => {
        if (event.type === HttpEventType.UploadProgress) {
          const total = event.total ?? 0;
          const progress = total ? Math.round((100 * event.loaded) / total) : 0;
          return { state: 'progress', progress };
        }
        if (event.type === HttpEventType.Response) {
          const item = event.body?.response?.[0];
          if (!item) throw new Error('Upload response did not contain a media item');
          return { state: 'done', data: item };
        }
        return { state: 'progress', progress: 0 };
      }),
      filter((v) => v.state === 'progress' || v.state === 'done'),
    );
  }

  updateProductImages(productId: string, newFiles: File[], oldUrls: string[]): Promise<UpdateMediaResponse> {
    const form = new FormData();
    for (const file of newFiles) form.append('newFiles', file);
    for (const url of oldUrls) form.append('oldUrls', url);
    return firstValueFrom(this.http.put<UpdateMediaResponse>(this.api.url(`/api/media/images/${productId}`), form));
  }
}
