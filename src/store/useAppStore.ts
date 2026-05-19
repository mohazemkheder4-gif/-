import { create } from 'zustand';
import { Player, Booking, Attendance, ChatMessage, Poll, SessionHistory, GuestRequest, BookingCategory } from '../types';

interface AppState {
  user: Player | null;
  bookings: Booking[];
  players: Player[];
  attendance: Attendance[];
  messages: ChatMessage[];
  polls: Poll[];
  history: SessionHistory[];
  guestRequests: GuestRequest[];
  
  // UI state
  activeTab: 'home' | 'lineup' | 'chat' | 'history' | 'admin' | 'profile';
  activeBookingId: string | null;
  viewingPlayerId: string | null;
  isLoggedIn: boolean;
  lineupSettings: {
    playersPerTeam: number;
    method: 'rating' | 'random';
  };
  appConfig: {
    loginImageUrl: string;
  };
  
  // Actions
  login: (pin: string) => Promise<boolean>;
  logout: () => void;
  setActiveTab: (tab: AppState['activeTab']) => void;
  setViewingPlayerId: (id: string | null) => void;
  setActiveBooking: (id: string) => void;
  markAttendance: (bookingId: string, playerId: string, status: 'حاضر' | 'غائب', reason?: string) => void;
  sendMessage: (content: string, type?: 'text' | 'image' | 'poll' | 'voice') => void;
  createPoll: (question: string, options: string[]) => void;
  voteInPoll: (pollId: string, optionId: string) => void;
  requestGuest: (guestName: string) => void;
  voteOnGuest: (requestId: string, vote: 'for' | 'against') => void;
  
  // Admin Actions
  addBooking: (booking: Omit<Booking, 'id' | 'status'>) => void;
  deleteBooking: (id: string) => void;
  updateBooking: (id: string, updates: Partial<Booking>) => void;
  createBookingProposalPoll: (category: BookingCategory, type: 'ثابت' | 'إضافي', date: string, time: string) => void;
  resetWeek: () => void;
  completeBooking: (id: string) => void;
  removeAttendance: (bookingId: string, playerId: string) => void;
  promoteToAdmin: (playerId: string) => void;
  demoteFromAdmin: (playerId: string) => void;
  updatePlayerPhone: (playerId: string, phone: string) => void;
  updatePlayerPin: (playerId: string, pin: string) => void;
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
  addPlayer: (player: Omit<Player, 'id' | 'stats' | 'isActive'>) => void;
  removePlayer: (playerId: string) => void;
  cancelBooking: (id: string, reason: string) => void;
  updateLineupSettings: (settings: Partial<AppState['lineupSettings']>) => void;
  updateAppConfig: (config: Partial<AppState['appConfig']>) => void;
}

// Mock Data
export const MOCK_PLAYERS: Player[] = [
  {
    id: '1',
    name: 'أحمد منصور',
    phone: '01066706529',
    pin: '123456',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
    isAdmin: true,
    isSuperAdmin: true,
    isVerified: true,
    isActive: true,
    rating: { speed: 9, shooting: 8, passing: 7, defense: 4, overall: 8.5 },
    stats: { matchesPlayed: 24, goals: 18, assists: 12, motmCount: 5 }
  },
  {
    id: '2',
    name: 'ياسر القحطاني',
    phone: '01011223344',
    pin: '000000',
    avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop',
    isAdmin: false,
    isActive: true,
    rating: { speed: 8, shooting: 9, passing: 8, defense: 5, overall: 8.9 },
    stats: { matchesPlayed: 20, goals: 15, assists: 10, motmCount: 4 }
  },
  {
    id: '3',
    name: 'أحمد العلي',
    phone: '01055667788',
    pin: '333333',
    avatarUrl: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop',
    isAdmin: false,
    isActive: true,
    rating: { speed: 5, shooting: 2, passing: 6, defense: 9, overall: 8.4 },
    stats: { matchesPlayed: 22, goals: 0, assists: 1, motmCount: 2 }
  }
];

const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    matchDate: '2026-05-22',
    matchTime: '20:00',
    matchEndTime: '22:00',
    venueName: 'ملعب الأساطير الدولي',
    venueMapsUrl: 'https://maps.google.com',
    status: 'مفتوح',
    type: 'ثابت',
    category: 'كرة قدم',
    reminderMinutes: [30, 60]
  }
];

export const useAppStore = create<AppState>((set) => ({
  user: null,
  bookings: MOCK_BOOKINGS,
  players: MOCK_PLAYERS,
  attendance: [],
  messages: [
    {
      id: 'm-poll-1',
      bookingId: 'b1',
      senderId: '1',
      type: 'poll',
      content: 'موعد التقسيمة القادمة',
      createdAt: new Date().toISOString(),
      pollId: 'p1'
    }
  ],
  polls: [
    {
      id: 'p1',
      question: 'موعد التقسيمة القادمة',
      isClosed: false,
      options: [
        { id: '1', text: 'السبت - 6:00 مساءً', votes: ['1', '2'] },
        { id: '2', text: 'الجمعة - 8:00 مساءً', votes: ['3'] }
      ]
    }
  ],
  history: [
    {
      id: 'h1',
      bookingId: 'old1',
      date: '2024-05-10',
      day: 'الجمعة',
      attendees: ['1', '2', '3'],
      absentees: ['4']
    }
  ],
  guestRequests: [
    {
      id: 'g1',
      bookingId: 'b1',
      requesterId: '2',
      guestName: 'خالد محمد',
      votes: [
        { playerId: '1', vote: 'for' }
      ],
      status: 'pending',
      createdAt: new Date().toISOString()
    }
  ],
  activeTab: 'home',
  activeBookingId: 'b1',
  viewingPlayerId: null,
  isLoggedIn: false,
  lineupSettings: {
    playersPerTeam: 6,
    method: 'rating'
  },
  appConfig: {
    loginImageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=200&h=200&fit=crop'
  },

  login: async (pin: string) => {
    const foundUser = useAppStore.getState().players.find(p => p.pin === pin);
    if (foundUser) {
      set({ user: foundUser, isLoggedIn: true, viewingPlayerId: null });
      return true;
    }
    return false;
  },

  logout: () => set({ user: null, isLoggedIn: false, viewingPlayerId: null }),

  setActiveTab: (tab) => set({ activeTab: tab, viewingPlayerId: tab === 'profile' ? useAppStore.getState().viewingPlayerId : null }),

  setViewingPlayerId: (id) => set({ viewingPlayerId: id, activeTab: 'profile' }),

  setActiveBooking: (id) => set({ activeBookingId: id }),

  markAttendance: (bookingId, playerId, status, reason) => set((state) => {
    const existing = state.attendance.find(a => a.bookingId === bookingId && a.playerId === playerId);
    if (existing) {
      return {
        attendance: state.attendance.map(a => 
          a.id === existing.id ? { ...a, status, reason } : a
        )
      };
    }
    const newAttendance: Attendance = {
      id: Math.random().toString(36).substr(2, 9),
      bookingId,
      playerId,
      status,
      reason
    };
    return { attendance: [...state.attendance, newAttendance] };
  }),

  sendMessage: (content, type = 'text') => set((state) => {
    if (!state.user) return state;
    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      bookingId: state.activeBookingId || 'none',
      senderId: state.user.id,
      type,
      content,
      createdAt: new Date().toISOString()
    };
    return { messages: [...state.messages, newMessage] };
  }),

  createPoll: (question, options) => set((state) => {
    if (!state.user) return state;
    const pollId = Math.random().toString(36).substr(2, 9);
    const newPoll: Poll = {
      id: pollId,
      question,
      isClosed: false,
      options: options.map((opt, index) => ({
        id: (index + 1).toString(),
        text: opt,
        votes: []
      }))
    };

    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      bookingId: state.activeBookingId || 'none',
      senderId: state.user.id,
      type: 'poll',
      content: question,
      createdAt: new Date().toISOString(),
      pollId
    };

    return {
      polls: [...state.polls, newPoll],
      messages: [...state.messages, newMessage]
    };
  }),

  voteInPoll: (pollId, optionId) => set((state) => {
    if (!state.user) return state;
    const userId = state.user.id;
    return {
      polls: state.polls.map(p => {
        if (p.id !== pollId) return p;
        return {
          ...p,
          options: p.options.map(o => {
            const filteredVotes = o.votes.filter(id => id !== userId);
            if (o.id === optionId) {
              return { ...o, votes: [...filteredVotes, userId] };
            }
            return { ...o, votes: filteredVotes };
          })
        };
      })
    };
  }),

  addBooking: (bookingData) => set((state) => {
    const newBooking: Booking = {
      ...bookingData,
      id: Math.random().toString(36).substr(2, 9),
      status: 'مفتوح',
      reminderMinutes: [30, 60]
    };
    return { 
      bookings: [...state.bookings, newBooking],
      activeBookingId: state.activeBookingId || newBooking.id
    };
  }),

  createBookingProposalPoll: (category, type, date, time) => set((state) => {
    const pollId = Math.random().toString(36).substr(2, 9);
    const newPoll: Poll = {
      id: pollId,
      question: `تصويت لعمل حجز ${type} (${category}) في تاريخ ${date} الساعة ${time}؟`,
      isClosed: false,
      options: [
        { id: '1', text: 'نعم، موافق', votes: [] },
        { id: '2', text: 'لا، غير مناسب', votes: [] }
      ]
    };

    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      bookingId: state.activeBookingId || 'none',
      senderId: state.user?.id || 'admin',
      type: 'poll',
      content: newPoll.question,
      createdAt: new Date().toISOString(),
      pollId
    };

    return {
      polls: [...state.polls, newPoll],
      messages: [...state.messages, newMessage]
    };
  }),

  deleteBooking: (id) => set((state) => {
    const newBookings = state.bookings.filter(b => b.id !== id);
    return {
      bookings: newBookings,
      activeBookingId: state.activeBookingId === id ? (newBookings[0]?.id || null) : state.activeBookingId
    };
  }),

  updateBooking: (id, updates) => set((state) => ({
    bookings: state.bookings.map(b => b.id === id ? { ...b, ...updates } : b)
  })),

  resetWeek: () => set((state) => {
    const currentId = state.activeBookingId;
    const current = state.bookings.find(b => b.id === currentId);
    if (current && state.attendance.length > 0) {
      const attendees = state.attendance.filter(a => a.bookingId === currentId && a.status === 'حاضر').map(a => a.playerId);
      const absentees = state.attendance.filter(a => a.bookingId === currentId && a.status === 'غائب').map(a => a.playerId);
      
      const newHistory: SessionHistory = {
        id: Math.random().toString(36).substr(2, 9),
        bookingId: current.id,
        date: current.matchDate,
        day: 'يوم اللعب',
        attendees,
        absentees
      };
      
      // Optionally remove the finished booking or mark it finished
      // If it's a fixed booking, roll it forward. If extra, mark finished.
      const updatedBookings = state.bookings.map(b => {
        if (b.id !== currentId) return b;
        if (b.type === 'ثابت') {
          // Add 7 days to matchDate
          const currentMatchDate = new Date(b.matchDate);
          currentMatchDate.setDate(currentMatchDate.getDate() + 7);
          return {
            ...b,
            matchDate: currentMatchDate.toISOString().split('T')[0],
            status: 'مفتوح'
          };
        }
        return { ...b, status: 'منتهي' };
      }) as Booking[];
      
      return {
        attendance: state.attendance.filter(a => a.bookingId !== currentId),
        guestRequests: state.guestRequests.filter(r => r.bookingId !== currentId),
        messages: [],
        history: [newHistory, ...state.history],
        bookings: updatedBookings
      };
    }
    return { attendance: [], messages: [] };
  }),

  completeBooking: (id: string) => set((state) => {
    const target = state.bookings.find(b => b.id === id);
    if (!target) return state;

    const attendees = state.attendance.filter(a => a.bookingId === id && a.status === 'حاضر').map(a => a.playerId);
    const absentees = state.attendance.filter(a => a.bookingId === id && a.status === 'غائب').map(a => a.playerId);

    const newHistoryEntry: SessionHistory = {
      id: Math.random().toString(36).substr(2, 9),
      bookingId: target.id,
      date: target.matchDate,
      day: 'يوم اللعب',
      attendees,
      absentees
    };

    const updatedBookings = state.bookings.filter(b => {
      if (b.id !== id) return true;
      if (b.type === 'إضافي') return false; // Delete additional bookings
      return true;
    }).map(b => {
      if (b.id !== id) return b;
      if (b.type === 'ثابت') {
        const nextDate = new Date(b.matchDate);
        nextDate.setDate(nextDate.getDate() + 7);
        return {
          ...b,
          matchDate: nextDate.toISOString().split('T')[0],
          status: 'مفتوح'
        };
      }
      return b;
    }) as Booking[];

    // Find next active booking if current one was active
    let nextActiveId = state.activeBookingId;
    if (state.activeBookingId === id) {
      const remaining = updatedBookings.filter(b => b.status === 'مفتوح');
      if (remaining.length > 0) {
        // Find closest date
        nextActiveId = remaining.sort((a, b) => a.matchDate.localeCompare(b.matchDate))[0].id;
      }
    }

    return {
      history: [newHistoryEntry, ...state.history],
      attendance: state.attendance.filter(a => a.bookingId !== id),
      guestRequests: state.guestRequests.filter(r => r.bookingId !== id),
      bookings: updatedBookings,
      activeBookingId: nextActiveId
    };
  }),

  removeAttendance: (bookingId: string, playerId: string) => set((state) => ({
    attendance: state.attendance.filter(a => !(a.bookingId === bookingId && a.playerId === playerId))
  })),

  promoteToAdmin: (playerId) => set((state) => ({
    players: state.players.map(p => p.id === playerId ? { ...p, isAdmin: true, isVerified: true } : p),
    user: state.user?.id === playerId ? { ...state.user, isAdmin: true, isVerified: true } : state.user
  })),

  demoteFromAdmin: (playerId) => set((state) => ({
    players: state.players.map(p => p.id === playerId ? { ...p, isAdmin: false } : p),
    user: state.user?.id === playerId ? { ...state.user, isAdmin: false } : state.user
  })),

  updatePlayerPhone: (playerId, phone) => set((state) => ({
    players: state.players.map(p => p.id === playerId ? { ...p, phone } : p),
    user: state.user?.id === playerId ? { ...state.user, phone } : state.user
  })),

  updatePlayerPin: (playerId, pin) => set((state) => ({
    players: state.players.map(p => p.id === playerId ? { ...p, pin } : p),
    user: state.user?.id === playerId ? { ...state.user, pin } : state.user
  })),

  updatePlayer: (playerId, updates) => set((state) => ({
    players: state.players.map(p => p.id === playerId ? { ...p, ...updates } : p),
    user: state.user?.id === playerId ? { ...state.user, ...updates } : state.user
  })),

  addPlayer: (playerData) => set((state) => ({
    players: [...state.players, {
      ...playerData,
      id: Math.random().toString(36).substr(2, 9),
      stats: { matchesPlayed: 0, goals: 0, assists: 0, motmCount: 0 },
      isActive: true
    }]
  })),

  removePlayer: (playerId) => set((state) => ({
    players: state.players.filter(p => p.id !== playerId)
  })),

  cancelBooking: (id, reason) => set((state) => ({
    bookings: state.bookings.map(b => b.id === id ? { ...b, status: 'ملغي' } : b) as Booking[],
    messages: [...state.messages, {
      id: 'cancel-' + Date.now(),
      bookingId: id,
      senderId: state.user?.id || 'admin',
      type: 'text',
      content: `❌ للأسف تم إلغاء حجز ${state.bookings.find(b => b.id === id)?.type === 'ثابت' ? 'هذا الأسبوع' : 'الإضافي'}. السبب: ${reason}`,
      createdAt: new Date().toISOString()
    }]
  })),

  requestGuest: (guestName) => set((state) => {
    if (!state.user || !state.activeBookingId) return state;
    const newRequest: GuestRequest = {
      id: Math.random().toString(36).substr(2, 9),
      bookingId: state.activeBookingId,
      requesterId: state.user.id,
      guestName,
      votes: [],
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    return { guestRequests: [...state.guestRequests, newRequest] };
  }),

  voteOnGuest: (requestId, vote) => set((state) => {
    if (!state.user) return state;
    const userId = state.user.id;
    return {
      guestRequests: state.guestRequests.map(r => {
        if (r.id !== requestId) return r;
        const newVotes = r.votes.filter(v => v.playerId !== userId);
        newVotes.push({ playerId: userId, vote });
        
        const forVotes = newVotes.filter(v => v.vote === 'for').length;
        const againstVotes = newVotes.filter(v => v.vote === 'against').length;
        
        let status = r.status;
        if (forVotes >= 2) status = 'accepted'; 
        if (againstVotes >= 2) status = 'rejected';

        return { ...r, votes: newVotes, status };
      })
    };
  }),

  updateLineupSettings: (settings) => set((state) => ({
    lineupSettings: { ...state.lineupSettings, ...settings }
  })),

  updateAppConfig: (config) => set((state) => ({
    appConfig: { ...state.appConfig, ...config }
  })),
}));
