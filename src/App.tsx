import React, { useEffect, useState, useRef, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import Split from 'react-split';
import { Editor } from './components/Editor';
import { AIAssistant } from './components/AIAssistant';
import { AssetPanel } from './components/AssetPanel';
import { HomePage } from './pages/HomePage';
import { useStore, Asset, Project } from './store/useStore';
import { executionService } from './services/execution';
import { authAPI, dbAPI } from './services/api';
import { Loader, LogIn, LogOut, Plus } from 'lucide-react';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { firebaseApp } from './firebase';


const ProjectEditor: React.FC = () => {
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);
  const { id } = useParams<{ id: string }>();
  const { projects, setProject, setAssets, selectAsset, project, assets } = useStore();
  const [isLoading, setIsLoading] = useState(false);

  // Load project and set initial file
  const codeRef = useRef<string | null>(null);
  useEffect(() => {
    if (id) {
      const currentProject = projects.find(p => p.id === id);
      if (currentProject) {
        // Set the current project
        setProject(currentProject);

        // Set the project assets
        if (currentProject.assets) {
          setAssets(currentProject.assets);
          const firstFile = findFirstFile(currentProject.assets);
          if (firstFile) {
            selectAsset(firstFile.id);
            codeRef.current = firstFile.code;
          }
        }
      }
    }
  }, [id, projects, setProject, setAssets, selectAsset]);

  const findFirstFile = useCallback((assets: Asset[]): { id: string; code: string } | null => {
    for (const asset of assets) {
      if (asset.type === 'file') {
        return { id: asset.id, code: asset.code };
      }
      if (asset.children && asset.children.length > 0) {
        const file = findFirstFile(asset.children);
        if (file) return file;
      }
    }
    return null;
  }, []);

  const saveProject = useCallback(async () => {
    if (project && project.id) {
      try {
        setIsLoading(true);
        const projectId = project.id;
        const updatedProject: Project = {
          ...project,
          assets,
        };
        await dbAPI.updateProject(projectId, updatedProject);
        console.log('Project saved successfully.');
      } catch (error) {
        console.error('Failed to save project:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      console.warn('No project ID to save to.');
    }
  }, [project, assets]);

  const toggleRightPanel = () => {
    setIsRightPanelCollapsed(!isRightPanelCollapsed);
  };

  if (!project) {
    return <div>No project selected</div>;
  }

  return (
    <div className="flex-1 flex flex-col relative">
      {isLoading && (
        <div className="absolute top-0 left-0 w-full h-full bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <Loader className="w-10 h-10 text-indigo-500 animate-spin" />
        </div>
      )}
      <Split
        className="flex-1 flex"
        sizes={isRightPanelCollapsed ? [99, 1] : [75, 25]}
        minSize={[500, isRightPanelCollapsed ? 30 : 200]}
        maxSize={[Infinity, isRightPanelCollapsed ? 40 : 400]}
        gutterSize={4}
        snapOffset={0}
        dragInterval={1}
        style={{ display: 'flex' }}
        gutterStyle={() => ({
          backgroundColor: '#e5e7eb',
          cursor: 'col-resize',
        })}
      >
        <div className="flex-1 relative">
          {codeRef.current !== null ? (
            <Editor initialCode={codeRef.current} />
          ) : null}
        </div>
        <div className="flex h-full relative">
          <button
            onClick={saveProject}
            className="absolute top-2 right-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded z-10"
          >
            Save
          </button>
          <button
            className={`absolute -left-6 top-1/2 -translate-y-1/2 z-10 bg-gray-200 hover:bg-gray-300 p-1.5 rounded-l transition-transform duration-300 ${
              isRightPanelCollapsed ? 'rotate-180' : ''
            }`}
            onClick={toggleRightPanel}
          >
            ▶
          </button>
          <div className={`w-full h-full bg-white transition-all duration-300`}>
            <AssetPanel isCollapsed={isRightPanelCollapsed} />
          </div>
        </div>
      </Split>
      <AIAssistant />
    </div>
  );
};


const Documentation: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Documentation</h1>
      <div className="prose prose-lg">
        <h2>Getting Started</h2>
        <p>
          Random Labs is a browser-based coding environment that lets you create, run, and share code projects.
          All projects are saved locally on your device.
        </p>

        <h2>Features</h2>
        <ul>
          <li>Browser-based code editor with syntax highlighting</li>
          <li>Real-time code execution</li>
          <li>Project organization with files and folders</li>
          <li>Share your projects publicly</li>
          <li>Explore and learn from other projects</li>
        </ul>

        <h2>Keyboard Shortcuts</h2>
        <ul>
          <li><code>Ctrl/Cmd + S</code> - Save changes</li>
          <li><code>Ctrl/Cmd + Enter</code> - Run code</li>
          <li><code>Ctrl/Cmd + B</code> - Toggle sidebar</li>
          <li><code>F11</code> - Toggle fullscreen</li>
        </ul>
      </div>
    </div>
  );
};

const ProjectHeader: React.FC = () => {
  const { project, selectAsset, assets, createProject } = useStore();
  
  const handleFileClick = (assetId: string) => {
    selectAsset(assetId);
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2 flex justify-between items-center">
      <div>
        <h2 className="text-lg font-medium">{project?.name || 'Untitled Project'}</h2>
      </div>
      <div className="flex space-x-4">
        {assets.map((asset) => (
          <div key={asset.id} className="flex items-center" title={asset.name}>
            {asset.type === "folder" ? (
              <div className="text-gray-600 mr-2">{asset.name}</div>
            ) : (
              <button
                key={asset.id}
                className="text-blue-500 hover:underline"
                onClick={() => handleFileClick(asset.id)}
              >
                {asset.name}
              </button>
            )}
          </div>
        ))}
        <button
          onClick={createProject}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          <Plus />
          New Project
        </button>
        <button
          onClick={() => {

            const code = `console.log("Hello, world!");`;
            executionService.runCode(code).then((result) => {
              console.log('Execution result:', result);
            });
          }}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Run Code
        </button>
      </div>
    </div>
  );
};

const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">About Random Labs</h1>
      <div className="prose prose-lg">
        <p>
          Random Labs is a modern, browser-based coding environment designed to make coding
          accessible and fun. Whether you're learning to code, prototyping an idea, or
          building a full project, Random Labs provides the tools you need.
        </p>

        <h2>Why Random Labs?</h2>
        <ul>
          <li>No setup required - start coding instantly in your browser</li>
          <li>Local-first approach - your code stays on your device</li>
          <li>Modern editor features with real-time execution</li>
          <li>Share and learn from the community</li>
        </ul>

        <h2>Technology</h2>
        <p>
          Random Labs is built with modern web technologies including React, TypeScript,
          and Monaco Editor (the same editor that powers VS Code).
        </p>
        
        <h2>Libraries and Dependencies</h2>
        <p>This application uses the following open-source libraries:</p>
        <ul>
          <li><strong>React</strong> - A JavaScript library for building user interfaces</li>
          <li><strong>TypeScript</strong> - A typed superset of JavaScript</li>
          <li><strong>Vite</strong> - Next generation frontend tooling</li>
          <li><strong>Zustand</strong> - A small, fast and scalable state management solution</li>
          <li><strong>React Router</strong> - Declarative routing for React applications</li>
          <li><strong>Monaco Editor</strong> - The code editor that powers VS Code</li>
          <li><strong>Lucide Icons</strong> - Beautiful & consistent icons</li>
          <li><strong>TailwindCSS</strong> - A utility-first CSS framework</li>
          <li><strong>React Split</strong> - Split pane layout component</li>
        </ul>
      </div>
    </div>
  );
};


const AuthButtons: React.FC = () => {
  const { setCurrentUser, currentUser } = useStore();
  const auth = getAuth(firebaseApp);
  const provider = new GoogleAuthProvider();
  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setCurrentUser(user);
    } catch (error) {
      console.error('Sign in failed', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
    } catch (error) {
      console.error('Sign out failed', error);
    }
  };
  return (
    <div>
      {currentUser ? <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={handleSignOut}><LogOut/></button> : <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleSignIn}><LogIn/></button>}
    </div>
  );
};

const App: React.FC = () => {
  const { currentUser, setCurrentUser, fetchTopProjects, fetchProjects } = useStore();
  const [isInitializing, setIsInitializing] = useState(true);

  const auth = getAuth(firebaseApp);


  // Check for existing user session and load initial data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Try to get current user from local storage
        const user = await authAPI.getCurrentUser();
        if (user && user.uid) {
          setCurrentUser(user);
          await fetchProjects(user.uid);
        }
        // Load featured projects
        await fetchTopProjects(3);

      } catch (error) {
        console.error('Failed to initialize app:', error);
      } finally {
        setIsInitializing(false);
      }
    };
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setCurrentUser(user);
      }
    });

    initializeApp()
  }, [setCurrentUser, fetchTopProjects]);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <Router>
      <div className="h-screen flex flex-col bg-gray-50">
        {currentUser && <ProjectHeader />}
        <div className='fixed top-2 right-2 z-50'><AuthButtons /></div>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/project/:id" element={<ProjectEditor />} />
          <Route path="/docs" element={<Documentation />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );};

export default App;

export default App;