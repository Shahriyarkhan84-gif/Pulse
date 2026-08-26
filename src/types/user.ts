export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  followerCount: number;
  isLive: boolean;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
}
