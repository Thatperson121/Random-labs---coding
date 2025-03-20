import { User, Project, Asset } from '../types';

// Firebase-like implementation using local storage when server is unavailable
const STORAGE_KEYS = {
  USERS: 'codecollab_users',
  PROJECTS: 'codecollab_projects',
  CURRENT_USER: 'codecollab_current_user',
};

// Simulate network delay for a more realistic experience
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock server data
let serverUsers: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
let serverProjects: Project[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS) || '[]');

// Save data to local storage
const saveToStorage = () => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(serverUsers));
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(serverProjects));
};

// Authentication API
export const authAPI = {
  // Sign in (simulated)
  signIn: async (email: string, password: string): Promise<{ user: User | null; error?: string }> => {
    await delay(800);
    
    // Always return error for regular sign in
    return { 
      user: null, 
      error: 'Sign in functionality is currently unavailable. Please use guest access.'
    };
  },
  
  // Register (simulated)
  register: async (name: string, email: string, password: string): Promise<{ user: User | null; error?: string }> => {
    await delay(800);
    
    // Always return error for regular registration
    return {
      user: null,
      error: 'Registration functionality is currently unavailable. Please use guest access.'
    };
  },
  
  // Create a guest account
  createGuestAccount: async (name: string): Promise<User> => {
    await delay(400);
    
    const guestUser: User = {
      id: `guest_${Date.now().toString(36)}`,
      name: name || `Guest_${Math.floor(Math.random() * 1000)}`,
      email: `guest_${Date.now()}@codecollab.dev`,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      friends: [],
    };
    
    serverUsers.push(guestUser);
    saveToStorage();
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(guestUser));
    
    return guestUser;
  },
  
  // Get current user
  getCurrentUser: async (): Promise<User | null> => {
    const userJson = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!userJson) return null;
    return JSON.parse(userJson);
  },
  
  // Sign out
  signOut: async (): Promise<void> => {
    await delay(300);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

// Projects API
export const projectsAPI = {
  // Get all projects
  getAllProjects: async (): Promise<Project[]> => {
    await delay(600);
    return serverProjects.filter(p => p.visibility === 'public');
  },
  
  // Get top projects (by stars)
  getTopProjects: async (limit: number = 3): Promise<Project[]> => {
    await delay(600);
    return [...serverProjects]
      .filter(p => p.visibility === 'public')
      .sort((a, b) => (b.stars || 0) - (a.stars || 0))
      .slice(0, limit);
  },
  
  // Get user projects
  getUserProjects: async (userId: string): Promise<Project[]> => {
    await delay(600);
    return serverProjects.filter(p => p.ownerId === userId);
  },
  
  // Create project
  createProject: async (project: Omit<Project, 'id'>): Promise<Project> => {
    await delay(800);
    
    const newProject: Project = {
      ...project,
      id: `project_${Date.now().toString(36)}`,
      stars: 0,
      lastModified: new Date().toISOString().split('T')[0],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    serverProjects.push(newProject);
    saveToStorage();
    
    return newProject;
  },
  
  // Update project
  updateProject: async (projectId: string, updates: Partial<Project>): Promise<Project> => {
    await delay(600);
    
    const projectIndex = serverProjects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) {
      throw new Error('Project not found');
    }
    
    const updatedProject = {
      ...serverProjects[projectIndex],
      ...updates,
      updatedAt: new Date(),
      lastModified: new Date().toISOString().split('T')[0],
    };
    
    serverProjects[projectIndex] = updatedProject;
    saveToStorage();
    
    return updatedProject;
  },
  
  // Like project
  likeProject: async (projectId: string): Promise<Project> => {
    await delay(300);
    
    const projectIndex = serverProjects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) {
      throw new Error('Project not found');
    }
    
    const currentLikes = serverProjects[projectIndex].likes || 0;
    const currentStars = serverProjects[projectIndex].stars || 0;
    
    const updatedProject = {
      ...serverProjects[projectIndex],
      likes: currentLikes + 1,
      stars: currentStars + 1,
    };
    
    serverProjects[projectIndex] = updatedProject;
    saveToStorage();
    
    return updatedProject;
  },
  
  // Get project by ID
  getProjectById: async (projectId: string): Promise<Project | null> => {
    await delay(400);
    return serverProjects.find(p => p.id === projectId) || null;
  },
  
  // Add some initial example projects if none exist
  initializeExampleProjects: async (): Promise<void> => {
    if (serverProjects.length === 0) {
      const examples: Project[] = [
        {
          id: 'example_1',
          name: 'React Todo App',
          description: 'A simple todo application built with React and TypeScript',
          language: 'TypeScript',
          lastModified: '2024-03-20',
          stars: 24,
          visibility: 'public',
          ownerId: 'system',
          assets: [
            {
              id: 'index.ts',
              name: 'index.ts',
              type: 'file',
              fileType: 'text/typescript',
              size: 0,
              lastModified: new Date().toISOString(),
              content: '',
              metadata: { language: 'typescript' }
            }
          ],
          initialFile: 'index.ts'
        },
        {
          id: 'example_2',
          name: 'Python Data Visualization',
          description: 'Data visualization project using Python, Pandas and Matplotlib',
          language: 'Python',
          lastModified: '2024-03-19',
          stars: 18,
          visibility: 'public',
          ownerId: 'system',
          assets: [
            {
              id: 'main.py',
              name: 'main.py',
              type: 'file',
              fileType: 'text/x-python',
              size: 0,
              lastModified: new Date().toISOString(),
              content: '',
              metadata: { language: 'python' }
            }
          ],
          initialFile: 'main.py'
        },
        {
          id: 'example_3',
          name: 'Node.js REST API',
          description: 'A RESTful API built with Node.js and Express',
          language: 'JavaScript',
          lastModified: '2024-03-18',
          stars: 15,
          visibility: 'public',
          ownerId: 'system',
          assets: [
            {
              id: 'index.js',
              name: 'index.js',
              type: 'file',
              fileType: 'text/javascript',
              size: 0,
              lastModified: new Date().toISOString(),
              content: '',
              metadata: { language: 'javascript' }
            }
          ],
          initialFile: 'index.js'
        }
      ];
      
      serverProjects = examples;
      saveToStorage();
    }
  }
};

// Initialize example projects
projectsAPI.initializeExampleProjects(); 