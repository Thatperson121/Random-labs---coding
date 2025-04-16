import { User, Project, UserData } from '../types';
import { worker } from '../workers/execution.worker';


// Configuration for local storage
const storagePrefix = import.meta.env.VITE_STORAGE_PREFIX || 'codecollab';

// Function to retrieve data from the worker
const workerRequest = async (action: string, payload: any = null): Promise<any> => {
  return worker.run({ action, payload });
};
// Authentication API
export const authAPI = {
  // Sign in (simulated)
  signIn: async (email: string, password: string): Promise<{ user: User | null; error?: string }> => {

    
    // Log API key usage (this is just for demonstration, would not do in production)
    console.log('Using API configuration:', { 
      url: apiConfig.apiUrl,
      prefix: apiConfig.storagePrefix,
      // Never log the actual API key!
      usingApiKey: !!apiConfig.apiKey
    });
    
    return workerRequest("signIn", { email, password });
  },
  
  // Register (simulated)
  register: async (name: string, email: string, password: string): Promise<{ user: User | null; error?: string }> => {

    return workerRequest("register", { name, email, password });
  },

  createGuestAccount: async (name: string): Promise<User> => {
    // Create new user
    const newUser: User = {
      id: `user_${Date.now().toString(36)}`,
      name,
      email,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      friends: [],
    };
    
    return workerRequest("createGuestAccount", { name });
  },
  
  // Get current user
  getCurrentUser: async (): Promise<User | null> => {
    return workerRequest("getCurrentUser");
  },
  signOut: async (): Promise<void> => workerRequest("signOut"),

  getAllUsers: async (): Promise<UserData[]> => {
    return workerRequest("getAllUsers");
  }
};

// Projects API
export const projectsAPI = {
  // Get all projects
  getAllProjects: async (): Promise<Project[]> => {
    await delay(600);
    return workerRequest("getAllProjects");
  },
  
  // Get top projects (by stars)
  getTopProjects: async (limit: number = 3): Promise<Project[]> => {
    return workerRequest("getTopProjects", limit).then(serverProjects => [...serverProjects]
      .sort((a, b) => (b.stars || 0) - (a.stars || 0))
      .slice(0, limit);
  },
  
  // Get user projects
  getUserProjects: async (userId: string): Promise<Project[]> => {
    await delay(600);
    return workerRequest("getUserProjects", userId);
  },
  
  // Create project
  createProject: async (project: Omit<Project, 'id'>): Promise<Project> => {
    const newProject = project;
    return workerRequest("createProject", newProject);
  },
  
  // Update project
  updateProject: async (projectId: string, updates: Partial<Project>): Promise<Project> => {
    return workerRequest("updateProject", { projectId, updates });
  },

  getProjectById: async (projectId: string): Promise<Project | null> => {
    return workerRequest("getProjectById", projectId);
  },
  deleteProject: async(projectId: string): Promise<void> => {
    return workerRequest("deleteProject", projectId);
  }
};

