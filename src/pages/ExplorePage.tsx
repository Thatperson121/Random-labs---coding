import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Code2, Server, Database, Star, GitFork } from 'lucide-react';
import { useStore } from '../store/useStore';

export const ExplorePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const { projects } = useStore();

  // Filter for public projects only
  const publicProjects = projects.filter(p => p.visibility === 'public');

  const filteredProjects = publicProjects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLanguage = !selectedLanguage || project.language === selectedLanguage;
    return matchesSearch && matchesLanguage;
  });

  const languages = Array.from(new Set(publicProjects.map(p => p.language)));

  const getLanguageIcon = (language: string) => {
    switch (language) {
      case 'TypeScript':
      case 'JavaScript':
        return <Code2 className="w-5 h-5 text-blue-500" />;
      case 'Python':
        return <Database className="w-5 h-5 text-yellow-500" />;
      default:
        return <Server className="w-5 h-5 text-green-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Explore Projects</h1>
            <p className="mt-2 text-sm text-gray-600">
              Discover and learn from public projects created by the community
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                !selectedLanguage ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedLanguage(null)}
            >
              All
            </button>
            {languages.map(lang => (
              <button
                key={lang}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                  selectedLanguage === lang ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setSelectedLanguage(lang)}
              >
                {getLanguageIcon(lang)}
                <span>{lang}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <div
              key={project.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/project/${project.id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {getLanguageIcon(project.language)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-500">{project.description}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <span>Updated {new Date(project.lastModified).toLocaleDateString()}</span>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4" />
                    <span>{project.stars}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <GitFork className="w-4 h-4" />
                    <span>{project.collaborators?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 