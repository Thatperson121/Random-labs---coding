import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Code2, LogOut, LogIn, File, Plus, Save, FolderOpen, UploadCloud } from 'lucide-react';
import { useStore } from '../store/useStore';
import { getDocs, collection, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const Header: React.FC = () => {
  const {
    currentUser,
    logout,
    projectFiles,
    createProjectFile,
    openProjectFile,
    saveProjectFile,
    currentProject
  } = useStore();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const [isFirebaseMenuOpen, setIsFirebaseMenuOpen] = useState(false);
  const [userProjects, setUserProjects] = useState<any[]>([]);
  const location = useLocation();
  const navigate = useNavigate();

  const fetchUserProjects = async () => {
    if (currentUser) {
      const projectsCollection = collection(db, 'users', currentUser.uid, 'projects');
      const projectSnapshot = await getDocs(projectsCollection);
      const projectList = projectSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUserProjects(projectList);
    } else {
      setUserProjects([]);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const handleCreateProjectFile = () => {
    createProjectFile();
    setIsProjectMenuOpen(false);
  }

  const handleOpenProjectFile = (filename: string) => {
    openProjectFile(filename);
    setIsProjectMenuOpen(false);
  }

  const handleSaveProjectToFirebase = async () => {
    if (!currentUser) return;

    const projectRef = doc(db, 'users', currentUser.uid, 'projects', currentProject.name);
    await setDoc(projectRef, {
      name: currentProject.name,
      content: currentProject.content,
      timestamp: new Date()
    });
    setIsFirebaseMenuOpen(false);
  };

  const handleLoadProjectFromFirebase = async (projectId: string) => {
    if (!currentUser) return;

    const projectRef = doc(db, 'users', currentUser.uid, 'projects', projectId);
    const projectSnapshot = await getDocs(collection(db, 'users', currentUser.uid, 'projects'));
    const loadedProject = projectSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).find(project => project.id === projectId);
    if (loadedProject) {
      openProjectFile(loadedProject.name, loadedProject.content);
    }
    setIsFirebaseMenuOpen(false);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!currentUser) return;
    try {
      const projectRef = doc(db, 'users', currentUser.uid, 'projects', projectId);
      await deleteDoc(projectRef);
      fetchUserProjects();
    } catch (error) {
      console.error("Error deleting project: ", error);
    }
  };

  useEffect(() => {
    fetchUserProjects();
  }, [currentUser]);

  const handleSignIn = () => {
    navigate('/signin');
  }

  return (
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Code2 className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-gray-900">Random Labs</span>
            </Link>
            
            {/* Project navigation and actions */}
            <div className="relative hidden md:ml-8 md:flex md:items-center">
                {/* Project Menu Button */}
                <button
                  onClick={() => setIsProjectMenuOpen(!isProjectMenuOpen)}
                  className="px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                >
                  <File className="w-4 h-4" />
                  <span>Project</span>
                </button>

                {isProjectMenuOpen && (
                  <div className="origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <button onClick={handleCreateProjectFile} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <Plus className="w-4 h-4 mr-2" /> New File
                    </button>
                    <button className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsFirebaseMenuOpen(!isFirebaseMenuOpen)}>
                      <UploadCloud className="w-4 h-4 mr-2" />
                      Firebase
                    </button>
                    <div className="border-t border-gray-100 mt-2 max-h-40 overflow-y-auto">
                        {projectFiles.map((file, index) => (
                          <button
                            key={index}
                            onClick={() => handleOpenProjectFile(file.name)}
                            className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 truncate">
                            {file.name}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
                {isFirebaseMenuOpen && (
                  <div className="origin-top-left absolute left-56 mt-2 w-56 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <div className="p-2 text-gray-700">
                      <p className="text-sm font-medium">Firebase Actions</p>
                    </div>
                    <button onClick={handleSaveProjectToFirebase} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <Save className="w-4 h-4 mr-2" /> Save to Firebase
                    </button>
                    <div className="border-t border-gray-100 mt-2 max-h-40 overflow-y-auto">
                      {userProjects.map((project) => (
                        <div key={project.id} className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <button onClick={() => handleLoadProjectFromFirebase(project.id)} className="w-full text-left">
                            {project.name}
                          </button>
                          <button onClick={() => handleDeleteProject(project.id)} className="text-red-500">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            <nav className="hidden md:ml-8 md:flex md:space-x-4">
            </nav>
          </div>

          <div className="flex items-center space-x-4">

            {currentUser ? (
              <div className="relative ml-3">
                <div>
                  <button
                    className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  >
                    <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                  </button>
                </div>
                {isUserMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                      <p className="font-medium">{currentUser.name}</p>
                      <p className="text-xs text-gray-500">{currentUser.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <div className="flex items-center">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign out
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={handleSignIn} className="btn-primary hidden md:block">
                <div className="flex items-center ">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign in
                </div>
              </button>
            )}
            <button
              className="btn-secondary hidden md:block"
              onClick={() => alert('Search functionality coming soon!')}
            >
              <div className="flex items-center">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <span className="ml-2">Search</span>
              </div>
            </button>

            <button
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden animate-fade-in">
            <div className="pt-2 pb-3 space-y-1">
            <div className="pt-4 pb-3 border-t border-gray-200">
              {currentUser ? (
                <>
                  <div className="flex items-center px-4 mb-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-800">{currentUser.name}</div>
                      <div className="text-xs text-gray-500">{currentUser.email}</div>
                    </div>
                  </div>
                  <Link
                    to="/new-project"
                    className="block w-full btn-primary mb-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    New Project
                  </Link>
                  <button
                    className="w-full btn-secondary flex items-center justify-center"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </button>
                  
                </>
              ) : (
                <button
                    className="w-full btn-primary mb-2 flex items-center justify-center"
                    onClick={handleSignIn}>
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign in
                  </button>
              )}
            </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );