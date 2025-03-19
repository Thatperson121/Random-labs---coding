export interface User {
  id: string;
  name: string;
  email: string;
  color: string;
  friends: string[];
  cursor?: {
    line: number;
    column: number;
  };
}

export interface Project {
  id: string;
  name: string;
  description: string;
  visibility: 'private' | 'shared' | 'public';
  collaborators: string[];
  ownerId: string;
  likes: number;
  language: string;
  code?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  createdAt: Date;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}