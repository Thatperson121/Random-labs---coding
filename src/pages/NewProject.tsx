import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, Server, FileCode, Layers, Database, FileEdit } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Asset } from '../types';

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: JSX.Element;
  defaultLanguage: string;
  supportedLanguages: string[];
}

export const NewProject: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'template' | 'details'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [mainFileName, setMainFileName] = useState<string>('');
  const { addProject } = useStore();

  const templates: ProjectTemplate[] = [
    {
      id: 'react',
      name: 'React Application',
      description: 'A modern React application with proper file structure and component organization',
      icon: (
        <Code2 className="w-8 h-8 text-blue-500" />
      ),
      defaultLanguage: 'typescript',
      supportedLanguages: ['javascript', 'typescript']
    },
    {
      id: 'node',
      name: 'Node.js API',
      description: 'Full-featured Node.js API with proper structure and middleware',
      icon: (
        <Server className="w-8 h-8 text-green-500" />
      ),
      defaultLanguage: 'javascript',
      supportedLanguages: ['javascript', 'typescript']
    },
    {
      id: 'python',
      name: 'Python Application',
      description: 'Multi-file Python application with proper package structure',
      icon: (
        <Database className="w-8 h-8 text-yellow-500" />
      ),
      defaultLanguage: 'python',
      supportedLanguages: ['python']
    },
    {
      id: 'blank',
      name: 'Blank Project',
      description: 'Start from scratch with a blank project and choose your language',
      icon: (
        <FileEdit className="w-8 h-8 text-purple-500" />
      ),
      defaultLanguage: 'javascript',
      supportedLanguages: ['javascript', 'typescript', 'python', 'java', 'html', 'css', 'json']
    },
  ];

  // Update language and file name when template changes
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedLanguage(template.defaultLanguage);
      
      // Set default main file name based on language
      switch(template.defaultLanguage) {
        case 'javascript':
          setMainFileName('index.js');
          break;
        case 'typescript':
          setMainFileName('index.ts');
          break;
        case 'python':
          setMainFileName('main.py');
          break;
        case 'java':
          setMainFileName('Main.java');
          break;
        case 'html':
          setMainFileName('index.html');
          break;
        case 'css':
          setMainFileName('styles.css');
          break;
        case 'json':
          setMainFileName('config.json');
          break;
        default:
          setMainFileName('main');
      }
    }
    setStep('details');
  };

  const getFileExtension = (language: string): string => {
    switch(language) {
      case 'javascript': return '.js';
      case 'typescript': return '.ts';
      case 'python': return '.py';
      case 'java': return '.java';
      case 'html': return '.html';
      case 'css': return '.css';
      case 'json': return '.json';
      default: return '';
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    setSelectedLanguage(newLanguage);
    
    // Update file extension if needed
    const currentExt = getFileExtension(selectedLanguage);
    const newExt = getFileExtension(newLanguage);
    
    if (mainFileName.endsWith(currentExt)) {
      const baseName = mainFileName.substring(0, mainFileName.length - currentExt.length);
      setMainFileName(baseName + newExt);
    } else if (!mainFileName.includes('.')) {
      setMainFileName(mainFileName + newExt);
    }
  };

  const handleCreateProject = () => {
    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) return;

    // Create initial file structure
    const initialAssets: Asset[] = [
      {
        id: 'src',
        name: 'src',
        type: 'folder',
        lastModified: new Date().toISOString(),
        size: 0,
        children: [
          {
            id: mainFileName,
            name: mainFileName,
            type: 'file',
            fileType: getFileTypeFromLanguage(selectedLanguage),
            lastModified: new Date().toISOString(),
            size: 0,
            metadata: {
              language: selectedLanguage
            }
          }
        ]
      }
    ];

    const newProject = {
      id: Math.random().toString(36).substr(2, 9),
      name: projectName || 'Untitled Project',
      description: projectDescription,
      language: selectedLanguage,
      lastModified: new Date().toISOString().split('T')[0],
      stars: 0,
      initialFile: `src/${mainFileName}`,
      assets: initialAssets
    };

    addProject(newProject);
    navigate(`/project/${newProject.id}`);
  };

  const getFileTypeFromLanguage = (language: string): string => {
    switch(language) {
      case 'javascript': return 'text/javascript';
      case 'typescript': return 'text/typescript';
      case 'python': return 'text/x-python';
      case 'java': return 'text/x-java';
      case 'html': return 'text/html';
      case 'css': return 'text/css';
      case 'json': return 'application/json';
      default: return 'text/plain';
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'template':
        return (
          <div className="animate-fade-in">
            <h2 className="text-lg font-medium text-gray-700 mb-4">Choose a template</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <button
                  key={template.id}
                  className={`card p-6 text-left transition-all ${
                    selectedTemplate === template.id
                      ? 'ring-2 ring-primary ring-offset-2'
                      : ''
                  }`}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <div className="flex items-center justify-between mb-4">
                    {template.icon}
                    {selectedTemplate === template.id && (
                      <svg
                        className="w-6 h-6 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-600">{template.description}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case 'details':
        const template = templates.find(t => t.id === selectedTemplate);
        return (
          <div className="animate-slide-in">
            <button
              className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
              onClick={() => setStep('template')}
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to templates
            </button>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Project Details</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="input"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="My Awesome Project"
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    className="input min-h-[100px]"
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Describe your project..."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                      Language
                    </label>
                    <select
                      id="language"
                      className="input"
                      value={selectedLanguage}
                      onChange={handleLanguageChange}
                    >
                      {template?.supportedLanguages.map(lang => (
                        <option key={lang} value={lang}>
                          {lang.charAt(0).toUpperCase() + lang.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="mainFile" className="block text-sm font-medium text-gray-700 mb-1">
                      Main File Name
                    </label>
                    <input
                      type="text"
                      id="mainFile"
                      className="input"
                      value={mainFileName}
                      onChange={(e) => setMainFileName(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="pt-4">
                  <button
                    className="btn-primary w-full"
                    onClick={handleCreateProject}
                    disabled={!projectName.trim() || !mainFileName.trim()}
                  >
                    Create Project
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Project</h1>
      {renderStep()}
    </div>
  );
};