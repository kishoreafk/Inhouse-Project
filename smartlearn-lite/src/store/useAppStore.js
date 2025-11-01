import { create } from 'zustand';

export const useAppStore = create((set) => ({
  videoUrl: '',
  transcript: '',
  currentTime: 0,
  distractionCount: 0,
  isPlaying: false,
  engagementStatus: 'ENGAGED',
  
  setVideoUrl: (url) => set({ videoUrl: url }),
  setTranscript: (text) => set({ transcript: text }),
  setCurrentTime: (time) => set({ currentTime: time }),
  incrementDistraction: () => set((state) => ({ distractionCount: state.distractionCount + 1 })),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setEngagementStatus: (status) => set({ engagementStatus: status }),
}));
