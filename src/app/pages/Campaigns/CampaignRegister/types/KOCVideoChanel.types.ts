export interface ICreatorChannelVideo {
  collectCount: number;
  commentCount: number;
  coverUrl: string;
  createdAt: string;
  deletedAt: string | null;
  desc: string;
  diggCount: number;
  dynamicCoverUrl: string | null;
  hashtags: string[];
  id: number;
  isAd: boolean;
  music?: {
    title?: string;
    authorName?: string;
    coverUrl?: string;
  };
  playCount: number;
  products: any[]; // thay bằng interface riêng nếu cần dùng product
  publishedAt: string;
  refCreatorChannelId: string;
  refVideoId: string;
  shareCount: number;
  title: string;
  updatedAt: string;
  videoUrl: string;
}

export interface ICreatorChannelVideosResponse {
  code: string | null;
  message: string | null;
  success: boolean;
  data: ICreatorChannelVideo[];
  meta: {
    pageNumber: number
    pageSize: number
    totalItems: number
    totalPages: number
  }
}

export interface ITikTokVideoSyncProgress {
  syncTaskId: string;
  status: string;
  percentage: number;
  completedCount: number;
  totalCount: number;
  failedCount?: number;
  error?: string | null;
  username?: string | null;
}

export interface ICreatorInfoResponse {
  code: string | null;
  message: string | null;
  success: boolean;
  data: {
    createdAt: string;
    deletedAt?: string | null;
    followerCount: number;
    followingCount: number;
    heartCount: number;
    id: number;
    refCreatorChannelId: string;
    secUid?: string;
    updatedAt: string;
    videoCount: number;
    avatarThumb?: string;
    nickname?: string;
    uniqueId?: string;
  };
}
