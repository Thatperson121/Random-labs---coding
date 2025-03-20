import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code2, ThumbsUp, GitFork, Users, Trophy, Loader, Plus } from 'lucide-react';
import { useStore } from '../store/useStore';

const languageColors: Record<string, string> = {
  TypeScript: 'bg-blue-100 text-blue-800',
  JavaScript: 'bg-yellow-100 text-yellow-800',
  Python: 'bg-green-100 text-green-800',
  Java: 'bg-red-100 text-red-800',
  HTML: 'bg-orange-100 text-orange-800',
  CSS: 'bg-purple-100 text-purple-800',
};

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    currentUser, 
    projects, 
    isLoading, 
    error,
    fetchTopProjects, 
    fetchProjects,
    getUserProjects,
    setProject 
  } = useStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isUserView, setIsUserView] = useState(false);

  // Fetch the correct projects based on view mode
  useEffect(() => {
    const loadProjects = async () => {
      if (currentUser && isUserView) {
        // Load user's projects if they're logged in and in user view
        try {
          const userProjects = await getUserProjects(currentUser.id);
          // This data is handled by the store
        } catch (error) {
          console.error("Failed to load user projects:", error);
        }
      } else {
        // Otherwise load public projects
        fetchProjects();
      }
    };
    
    loadProjects();
  }, [fetchProjects, currentUser, isUserView, getUserProjects]);

  // Get filtered projects
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase() || '');
    const matchesFilter = selectedFilter === 'all' || project.language === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  // Get unique languages from available projects
  const languages = Array.from(new Set(projects.map((p) => p.language)));

  const handleProjectClick = (project: typeof projects[0]) => {
    setProject(project);
    navigate(`/project/${project.id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isUserView && currentUser ? `${currentUser.name}'s Projects` : 'Community Projects'}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {isUserView && currentUser
              ? 'Manage and edit your personal coding projects'
              : 'Explore and learn from projects created by the community'}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
          {currentUser && (
            <button
              onClick={() => setIsUserView(!isUserView)}
              className="btn-secondary text-center"
            >
              {isUserView ? 'View Community Projects' : 'View My Projects'}
            </button>
          )}
          
          {currentUser ? (
            <Link
              to="/new-project"
              className="btn-primary text-center flex items-center justify-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Link>
          ) : (
            <Link
              to="/signin"
              className="btn-primary text-center"
            >
              Sign in to Create
            </Link>
          )}
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search projects..."
              className="input pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
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
          </div>
        </div>
        {languages.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <button
              className={`btn ${
                selectedFilter === 'all'
                  ? 'btn-primary'
                  : 'btn-secondary'
              }`}
              onClick={() => setSelectedFilter('all')}
            >
              All
            </button>
            {languages.map((lang) => (
              <button
                key={lang}
                className={`btn ${
                  selectedFilter === lang
                    ? 'btn-primary'
                    : 'btn-secondary'
                }`}
                onClick={() => setSelectedFilter(lang)}
              >
                {lang}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-md">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader className="w-8 h-8 text-indigo-500 animate-spin" />
          <span className="ml-2 text-gray-600">Loading projects...</span>
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Link
              key={project.id}
              to={`/project/${project.id}`}
              className="card p-6 group animate-slide-in transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary">
                    {project.name}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    {project.description}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  languageColors[project.language] || 'bg-gray-100 text-gray-800'
                }`}>
                  {project.language}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <span>Updated {project.lastModified}</span>
                <div className="flex items-center">
                  <ThumbsUp className="h-4 w-4 text-yellow-400 mr-1" />
                  <span>{project.stars || 0}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {isUserView 
              ? "You don't have any projects yet" 
              : "No projects found"}
          </h3>
          <p className="mt-2 text-base text-gray-500 max-w-md mx-auto">
            {isUserView 
              ? "Start by creating your first project. It's quick and easy!"
              : "Be the first to create a project in the community!"}
          </p>
          <div className="mt-6">
            {currentUser ? (
              <Link to="/new-project" className="btn-primary inline-flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Create a Project
              </Link>
            ) : (
              <Link to="/signin" className="btn-primary">
                Sign in to Create
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};