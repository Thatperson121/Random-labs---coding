import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Globe } from 'lucide-react';
import { useStore } from '../store/useStore';

export function NewProject() {
  const navigate = useNavigate();
  const addProject = useStore((state) => state.addProject);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'private' | 'public'>('private');
  const [language, setLanguage] = useState('JavaScript');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const project = {
      id: crypto.randomUUID(),
      name,
      description,
      visibility,
      language,
      likes: 0,
      collaborators: [],
      ownerId: 'current-user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    addProject(project);
    navigate(`/project/${project.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create New Project</h1>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="JavaScript">JavaScript</option>
                <option value="TypeScript">TypeScript</option>
                <option value="Python">Python</option>
                <option value="HTML">HTML</option>
                <option value="CSS">CSS</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Visibility
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setVisibility('private')}
                  className={`flex items-center justify-center space-x-2 p-3 rounded-lg border-2 ${
                    visibility === 'private'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Lock className="w-5 h-5" />
                  <span>Private</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility('public')}
                  className={`flex items-center justify-center space-x-2 p-3 rounded-lg border-2 ${
                    visibility === 'public'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Globe className="w-5 h-5" />
                  <span>Public</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}