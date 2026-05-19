export type BookingCategory = 'كرة قدم' | 'سباحة';

export interface PlayerRating {
  speed: number;
  shooting: number;
  passing: number;
  defense: number;
  overall: number;
}

export interface Player {
  id: string;
  name: string;
  phone: string;
  pin: string;
  avatarUrl?: string;
  isAdmin: boolean;
  isSuperAdmin?: boolean;
  isVerified?: boolean;
  isActive: boolean;
  rating: PlayerRating;
  stats: {
    matchesPlayed: number;
    goals: number;
    assists: number;
    motmCount: number;
  };
}

export interface Booking {
  id: string;
  matchDate: string;
  matchTime: string;
  matchEndTime: string;
  venueName: string;
  venueMapsUrl?: string;
  status: 'مفتوح' | 'ملغي' | 'منتهي';
  type: 'ثابت' | 'إضافي';
  category: BookingCategory;
  reminderMinutes?: number[];
}

export interface SessionHistory {
  id: string;
  bookingId: string;
  date: string;
  day: string;
  attendees: string[]; // IDs
  absentees: string[]; // IDs
}

export interface Attendance {
  id: string;
  bookingId: string;
  playerId: string;
  status: 'حاضر' | 'غائب';
  reason?: string;
}

export interface ChatMessage {
  id: string;
  bookingId: string;
  senderId: string;
  type: 'text' | 'image' | 'poll' | 'voice';
  content: string;
  createdAt: string;
  pollId?: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: string[]; // array of player ids
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  isClosed: boolean;
}

export interface GuestVote {
  playerId: string;
  vote: 'for' | 'against';
}

export interface GuestRequest {
  id: string;
  bookingId: string;
  requesterId: string;
  guestName: string;
  votes: GuestVote[];
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}
