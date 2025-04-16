import { create } from 'zustand';
import { User, Project, Asset, FriendRequest } from '../types';
import { authAPI, projectsAPI, firebaseAPI } from '../services/api';

type UserInfo = firebase.UserInfo;
interface State {
  activeFile: string | null;
  currentUser: User | null;
  project: Project | null;
  collaborators: User[];
  assets: Asset[];
  isAIPanelOpen: boolean;
  friendRequests: FriendRequest[];
  projects: Project[];
  user: UserInfo | null;
  isLoading: boolean;
  error: string | null;

  // Auth actions
  setCurrentUser: (user: User | null) => void;
  loginAsGuest: (name?: string) => Promise<void>;
  setUser: (user: UserInfo | null) => void;
  getOtherUsersCode: () => Promise<Project[]>;
  logout: () => Promise<void>;
  
  // Project actions
  setProject: (project: Project | null) => void;
  setActiveFile: (fileId: string | null) => void;
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
  
  // Save project function
  saveProject: () => Promise<Project | undefined>;
}


const GUEST_USER: User = {
  id: 'guest',
  name: 'Guest User',
  email: 'guest@codecollab.dev',
  color: '#6366f1',
  friends: [],
};

export const useStore = create<State>((set, get) => ({
  activeFile: null,
  currentUser: null,
  project: null,
  collaborators: [],
  assets: [],
  isAIPanelOpen: false,
  friendRequests: [],
  projects: [],
  user: null,
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
  
  setUser: (user) => set({ user: user }),
  
  getOtherUsersCode: async () => {
    set({ isLoading: true, error: null });
    const result = await firebaseAPI.getAllPublicProjects();
    set({ isLoading: false, projects: result });
    return result;
  },
  
  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      set({ currentUser: null, isLoading: false, user: null });
    } catch (error) {
      set({ error: 'Failed to sign out', isLoading: false });
    }
  },
  
  // Project actions
  setProject: (project) => set({ project }),
  setActiveFile: (fileId) => set({ activeFile: fileId }),
  setCollaborators: (collaborators) => set({ collaborators }),
  setAssets: (assets) => set({ assets }),
  
  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      if (get().user) {
        const projects = await firebaseAPI.getUserProjects(get().user?.uid);
        set({ projects, isLoading: false });
      } else {
        set({ projects: [], isLoading: false });
      }
    } catch (error) {
      set({ error: 'Failed to fetch user projects', isLoading: false });
    }
  },
  
  fetchTopProjects: async (limit = 3) => {
    set({ isLoading: true, error: null });
    const projects = await firebaseAPI.getTopProjects(limit);
    set({ projects, isLoading: false });
  }, 
  
  addProject: async (projectData) => {
    const { currentUser } = get();
    if (!currentUser) {
      set({ error: 'You must be logged in to create a project' });
      return;
    }
    
    set({ isLoading: true, error: null });
    try {  
      const newProject = await firebaseAPI.createProject({
        ...projectData, 
        userId: get().user?.uid,
      });
      
      set((state) => ({
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
      const updatedProject = await firebaseAPI.updateProject(projectId, updates);
      set((state) => ({
        projects: state.projects.map(p => p.id === projectId ? updatedProject : p),
        isLoading: false
      }));
    } catch (error) {
      set({ error: 'Failed to update project', isLoading: false });
    }
  },
  
  likeProject: async (projectId) => {
    try {
      const updatedProject = await firebaseAPI.likeProject(projectId);
      set((state) => ({
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
  
  selectAsset: (assetId) => set((state) => ({
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
  
  updateAssetContent: (assetId, content) => set((state) => {
    // Update the asset content in memory
    const updatedAssets = state.assets.map(asset => {
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
    });
    
    // Save the project with updated assets after content changes
    const { project } = state;
    if (project) {
      const current = new Date();
      const updatedProject = {
        ...project,
        assets: updatedAssets,
        updatedAt: current,
        lastModified: new Date().toISOString().split('T')[0]
      };
      
      firebaseAPI.updateProject(project.id, updatedProject)
        .catch(error => console.error('Failed to auto-save project:', error));
    }
    
    return { assets: updatedAssets };
  }),
  
  // Save project function to explicitly save project changes
  saveProject: async () => {
    const { project, assets } = get();
    if (!project) return;
    
    set({ isLoading: true, error: null });
    const current = new Date();
    try {
      // Update project with current assets
      const updatedProject = await firebaseAPI.updateProject(project.id, {
        ...project,
        assets,
        updatedAt: current,
        lastModified: current.toISOString().split('T')[0]
      });
      
      set({ project: updatedProject, isLoading: false });
      return updatedProject;
    } catch (error) {
      set({ error: 'Failed to save project', isLoading: false });
      console.error('Failed to save project:', error);
    }
  }
}));