import { create } from 'zustand';
import { User, Project, Asset, FriendRequest } from '../types';
import { authAPI, projectsAPI } from '../services/api';

interface State {
  currentUser: User | null;
  project: Project | null;
  collaborators: User[];
  assets: Asset[];
  isAIPanelOpen: boolean;
  friendRequests: FriendRequest[];
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  
  // Auth actions
  setCurrentUser: (user: User | null) => void;
  loginAsGuest: (name?: string) => Promise<void>;
  logout: () => Promise<void>;
  
  // Project actions
  setProject: (project: Project | null) => void;
  setCollaborators: (collaborators: User[]) => void;
  setAssets: (assets: Asset[]) => void;
  fetchProjects: () => Promise<void>;
  fetchTopProjects: (limit?: number) => Promise<void>;
  addProject: (project: Omit<Project, 'id'>) => Promise<void>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>;
  likeProject: (projectId: string) => Promise<void>;
  
  // UI actions
  toggleAIPanel: () => void;
  setFriendRequests: (requests: FriendRequest[]) => void;
  setProjects: (projects: Project[]) => void;
  selectAsset: (assetId: string) => void;
  updateAssetContent: (assetId: string, content: string) => void;
}

const GUEST_USER: User = {
  id: 'guest',
  name: 'Guest User',
  email: 'guest@codecollab.dev',
  color: '#6366f1',
  friends: [],
};

export const useStore = create<State>((set, get) => ({
  currentUser: null,
  project: null,
  collaborators: [],
  assets: [],
  isAIPanelOpen: false,
  friendRequests: [],
  projects: [],
  isLoading: false,
  error: null,
  
  // Auth actions
  setCurrentUser: (user) => set({ currentUser: user }),
  
  loginAsGuest: async (name) => {
    set({ isLoading: true, error: null });
    try {
      const guestUser = await authAPI.createGuestAccount(name || '');
      set({ currentUser: guestUser, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to create guest account', isLoading: false });
    }
  },
  
  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await authAPI.signOut();
      set({ currentUser: null, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to sign out', isLoading: false });
    }
  },
  
  // Project actions
  setProject: (project) => set({ project }),
  setCollaborators: (collaborators) => set({ collaborators }),
  setAssets: (assets) => set({ assets }),
  
  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const projects = await projectsAPI.getAllProjects();
      set({ projects, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch projects', isLoading: false });
    }
  },
  
  fetchTopProjects: async (limit = 3) => {
    set({ isLoading: true, error: null });
    try {
      const projects = await projectsAPI.getTopProjects(limit);
      set({ projects, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch top projects', isLoading: false });
    }
  },
  
  addProject: async (projectData) => {
    const { currentUser } = get();
    if (!currentUser) {
      set({ error: 'You must be logged in to create a project' });
      return;
    }
    
    set({ isLoading: true, error: null });
    try {
      const newProject = await projectsAPI.createProject({
        ...projectData,
        ownerId: currentUser.id,
        visibility: 'public',
      });
      
      set(state => ({ 
        projects: [...state.projects, newProject],
        isLoading: false 
      }));
    } catch (error) {
      set({ error: 'Failed to create project', isLoading: false });
    }
  },
  
  updateProject: async (projectId, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updatedProject = await projectsAPI.updateProject(projectId, updates);
      set(state => ({
        projects: state.projects.map(p => p.id === projectId ? updatedProject : p),
        isLoading: false
      }));
    } catch (error) {
      set({ error: 'Failed to update project', isLoading: false });
    }
  },
  
  likeProject: async (projectId) => {
    try {
      const updatedProject = await projectsAPI.likeProject(projectId);
      set(state => ({
        projects: state.projects.map(p => p.id === projectId ? updatedProject : p)
      }));
    } catch (error) {
      set({ error: 'Failed to like project' });
    }
  },
  
  // UI actions
  toggleAIPanel: () => set((state) => ({ isAIPanelOpen: !state.isAIPanelOpen })),
  setFriendRequests: (requests) => set({ friendRequests: requests }),
  setProjects: (projects) => set({ projects }),
  
  selectAsset: (assetId) => set(state => ({
    assets: state.assets.map(asset => {
      const markSelected = (a: Asset): Asset => {
        if (a.id === assetId) {
          return { ...a, selected: true };
        } else if (a.children) {
          return {
            ...a,
            selected: false,
            children: a.children.map(markSelected)
          };
        } else {
          return { ...a, selected: false };
        }
      };
      return markSelected(asset);
    })
  })),
  
  updateAssetContent: (assetId, content) => set(state => ({
    assets: state.assets.map(asset => {
      const updateContent = (a: Asset): Asset => {
        if (a.id === assetId) {
          return { ...a, content };
        } else if (a.children) {
          return {
            ...a,
            children: a.children.map(updateContent)
          };
        } else {
          return a;
        }
      };
      return updateContent(asset);
    })
  })),
}));