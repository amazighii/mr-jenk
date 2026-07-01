export interface MediaItem {
  id: string;
  filename: string;
  contentType: string;
  url: string;
  addedAt: string;
}

export interface MediaWrapperResponse {
  response: MediaItem[];
}

export interface UpdateMediaResponse {
  message: string;
  response: MediaWrapperResponse;
}

