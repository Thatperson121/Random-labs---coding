import { Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  name: string;
  email: string;
  color: string;
  friends?: string[];
  cursor?: {
    line: number;
    column?: number;
  };
}

export interface Project {
  id: string;
  name: string;
  description: string;
  language: string;
  lastModified: string;
  stars: number;
  likes?: number;
  visibility?: 'private' | 'shared' | 'public';
  collaborators?: string[] | null;
  ownerId?: string | null;
  code?: string;
  createdAt?: Date;
  updatedAt?: Date;
  assets?: Asset[];
  initialFile?: string;
}

export interface Asset {
  id: string;
  name: string;
  type: 'file' | 'folder';
  fileType?: string;
  url?: string;
  size: number;
  lastModified: string;
  children?: Asset[];
  metadata?: {
    language?: string;
    [key: string]: any;
  };
  content?: string;
    selected?: boolean;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export interface FirebaseProject extends Omit<Project, 'createdAt' | 'updatedAt'> {
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}