import { create } from 'zustand';
import { User, Project, Asset, FriendRequest } from '../types';

interface State {
  currentUser: User | null;
  project: Project | null;
  collaborators: User[];
  assets: Asset[];
  isAIPanelOpen: boolean;
  friendRequests: FriendRequest[];
  projects: Project[];
  setCurrentUser: (user: User | null) => void;
  setProject: (project: Project | null) => void;
  setCollaborators: (collaborators: User[]) => void;
  setAssets: (assets: Asset[]) => void;
  toggleAIPanel: () => void;
  setFriendRequests: (requests: FriendRequest[]) => void;
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  loginAsGuest: () => void;
  likeProject: (projectId: string) => void;
}

const GUEST_USER: User = {
  id: 'guest',
  name: 'Guest User',
  email: 'guest@codecollab.dev',
  color: '#6366f1',
  friends: [],
};

export const useStore = create<State>((set) => ({
  currentUser: null,
  project: null,
  collaborators: [],
  assets: [],
  isAIPanelOpen: false,
  friendRequests: [],
  projects: [],
  setCurrentUser: (user) => set({ currentUser: user }),
  setProject: (project) => set({ project }),
  setCollaborators: (collaborators) => set({ collaborators }),
  setAssets: (assets) => set({ assets }),
  toggleAIPanel: () => set((state) => ({ isAIPanelOpen: !state.isAIPanelOpen })),
  setFriendRequests: (requests) => set({ friendRequests: requests }),
  setProjects: (projects) => set({ projects }),
  addProject: (project) => set((state) => ({ 
    projects: [...state.projects, project] 
  })),
  updateProject: (project) => set((state) => ({
    projects: state.projects.map(p => p.id === project.id ? project : p)
  })),
  loginAsGuest: () => set({ currentUser: GUEST_USER }),
  likeProject: (projectId) => set((state) => ({
    projects: state.projects.map(p => 
      p.id === projectId ? { ...p, likes: p.likes + 1 } : p
    )
  })),
}));