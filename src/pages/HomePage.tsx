import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code2, ThumbsUp, GitFork, Users, Trophy, Loader } from 'lucide-react';
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
    setProject 
  } = useStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Fetch top projects when component mounts
  useEffect(() => {
    fetchTopProjects(3);
  }, [fetchTopProjects]);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || project.language === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const languages = Array.from(new Set(projects.map((p) => p.language)));

  const handleProjectClick = (project: typeof projects[0]) => {
    setProject(project);
    navigate(`/project/${project.id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Featured Projects</h1>
          <p className="mt-2 text-sm text-gray-600">
            Explore and learn from popular projects in the community
          </p>
        </div>
        {currentUser ? (
          <Link
            to="/new-project"
            className="btn-primary mt-4 md:mt-0 text-center"
          >
            Create New Project
          </Link>
        ) : (
          <Link
            to="/signin"
            className="btn-primary mt-4 md:mt-0 text-center"
          >
            Sign in to Create
          </Link>
        )}
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
      ) : (
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
      )}

      {!isLoading && filteredProjects.length === 0 && (
        <div className="text-center py-12">
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
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No projects found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  );
};