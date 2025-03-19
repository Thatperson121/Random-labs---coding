import React from 'react';
import { Share2, Settings, Users, Plus, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

export function Header() {
  const navigate = useNavigate();
  const { project, currentUser } = useStore();
  const collaborators = useStore((state) => state.collaborators);

  const handleNewProject = () => {
    navigate('/new-project');
  };

  return (
    <header className="h-12 bg-gray-900 text-white flex items-center px-4 justify-between">
      <div className="flex items-center space-x-4">
        <Link to="/" className="text-lg font-bold hover:text-blue-400">CodeCollab</Link>
        {project && (
          <>
            <span className="text-gray-400">/</span>
            <h1 className="text-lg font-semibold">{project.name}</h1>
            <span className="text-gray-400 text-sm">
              {project.visibility === 'private' ? 'Private' : 
               project.visibility === 'shared' ? 'Shared' : 'Public'}
            </span>
          </>
        )}
      </div>
      
      <div className="flex items-center space-x-4">
        {currentUser ? (
          <>
            {project && (
              <>
                <div className="flex -space-x-2">
                  {collaborators.map((user) => (
                    <div
                      key={user.id}
                      className="w-8 h-8 rounded-full border-2 border-gray-900 flex items-center justify-center"
                      style={{ backgroundColor: user.color }}
                      title={user.name}
                    >
                      {user.name[0].toUpperCase()}
                    </div>
                  ))}
                </div>
                <button className="p-2 hover:bg-gray-700 rounded-lg">
                  <Share2 className="w-5 h-5" />
                </button>
              </>
            )}
            <button 
              onClick={handleNewProject}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
            <Link to="/friends" className="p-2 hover:bg-gray-700 rounded-lg">
              <Users className="w-5 h-5" />
            </Link>
            <button className="p-2 hover:bg-gray-700 rounded-lg">
              <Settings className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-700 rounded-lg">
              <LogOut className="w-5 h-5" />
            </button>
          </>
        ) : (
          <div className="space-x-2">
            <Link to="/login" className="px-4 py-1.5 hover:bg-gray-700 rounded-lg">
              Log In
            </Link>
            <Link to="/signup" className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}