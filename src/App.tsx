import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import Split from 'react-split';
import { Header } from './components/Header';
import { CodeEditor } from './components/Editor';
import { AIAssistant } from './components/AIAssistant';
import { AssetPanel } from './components/AssetPanel';
import { HomePage } from './pages/HomePage';
import { NewProject } from './pages/NewProject';
import { ExplorePage } from './pages/ExplorePage';
import { SignInPage } from './pages/SignInPage';
import { useStore } from './store/useStore';
import { authAPI } from './services/api';
import { Loader } from 'lucide-react';

function ProjectEditor() {
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);
  const { id } = useParams<{ id: string }>();
  const { projects, setProject, setAssets, selectAsset } = useStore();

  // Load project and set initial file when component mounts
  useEffect(() => {
    if (id) {
      const currentProject = projects.find(p => p.id === id);
      if (currentProject) {
        // Set the current project
        setProject(currentProject);
        
        // Set the project assets
        if (currentProject.assets) {
          setAssets(currentProject.assets);
          
          // If there's only one asset, select it
          if (currentProject.assets.length === 1 && currentProject.assets[0].type === 'file') {
            selectAsset(currentProject.assets[0].id);
          } else {
            // Otherwise find the first file
            const findFirstFile = (assets: any[]): string | null => {
              for (const asset of assets) {
                if (asset.type === 'file') {
                  return asset.id;
                }
                if (asset.children && asset.children.length > 0) {
                  const fileId = findFirstFile(asset.children);
                  if (fileId) return fileId;
                }
              }
              return null;
            };
            
            // Select the first file
            const firstFileId = findFirstFile(currentProject.assets);
            if (firstFileId) {
              selectAsset(firstFileId);
            }
          }
        }
      }
    }
  }, [id, projects, setProject, setAssets, selectAsset]);

  const toggleRightPanel = () => {
    setIsRightPanelCollapsed(!isRightPanelCollapsed);
  };

  return (
    <div className="flex-1 flex flex-col">
      <Split
        className="flex-1 flex"
        sizes={isRightPanelCollapsed ? [98, 2] : [75, 25]}
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
          <CodeEditor />
        </div>
        <div className="flex h-full relative">
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
}

function Documentation() {
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
}

function About() {
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
      </div>
    </div>
  );
}

function App() {
  const { currentUser, setCurrentUser, fetchTopProjects } = useStore();
  const [isInitializing, setIsInitializing] = useState(true);

  // Check for existing user session and load initial data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Try to get current user from local storage
        const user = await authAPI.getCurrentUser();
        if (user) {
          setCurrentUser(user);
        }
        // Load featured projects
        await fetchTopProjects(3);
      } catch (error) {
        console.error('Failed to initialize app:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();
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
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/new-project" element={<NewProject />} />
          <Route path="/project/:id" element={<ProjectEditor />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/docs" element={<Documentation />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;