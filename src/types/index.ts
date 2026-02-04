export interface User {
  id: string;
  email: string;
  photos: string[]; // URLs of 3 selfies
  ratingsGiven: number; // Number of ratings this user has given
  ratingsReceived: Rating[];
  averageRating: number | null;
  createdAt: Date;
  hasCompletedProfile: boolean;
}

export interface Rating {
  raterId: string;
  score: number; // 1-10
  createdAt: Date;
}

export interface UserToRate {
  id: string;
  photos: string[];
}
