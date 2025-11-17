export enum FeatureTab {
  Galaxy = 'Galaxy',
  Chat = 'Chat',
  AudioJournal = 'AudioJournal',
  Create = 'Create',
  Gallery = 'Gallery',
  Garden = 'Garden',
  Talk = 'Talk',
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
}

export interface UserProfile {
  age: string;
  topic: string; // This will now be the chosen "Galaxy"
}

export interface GeneratedImage {
  id: string;
  prompt: string;
  imageUrl: string;
  timestamp: number;
}

export interface MissionState {
  completedMissions: string[]; // Array of mission IDs
}

export interface AudioEntry {
    id:string;
    title: string;
    transcript: string;
    audioSrc: string; // base64 data URI
    timestamp: number;
}

export interface Toast {
    id: number;
    message: string;
    action?: {
        label: string;
        onClick: () => void;
    }
}