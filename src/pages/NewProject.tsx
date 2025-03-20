import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, Server, FileCode, Layers, Database, FileEdit, Loader } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Asset } from '../types';

// Define starter code templates for different languages
const STARTER_CODE = {
  javascript: `// JavaScript starter code
console.log('Hello, world!');

// Write your JavaScript code here
function greet(name) {
  return 'Hello, ' + name + '!';
}

// Test the function
console.log(greet('Coder'));
`,
  typescript: `// TypeScript starter code
console.log('Hello, TypeScript!');

// Define a typed function
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

// Define an interface
interface User {
  name: string;
  age: number;
}

// Create a user object
const user: User = {
  name: 'TypeScript User',
  age: 25
};

console.log(greet(user.name));
`,
  python: `# Python starter code
print("Hello, Python!")

# Define a function
def greet(name):
    return f"Hello, {name}!"

# Test the function
print(greet("Pythonista"))

# Example using math library
import math
print(f"The square root of 16 is {math.sqrt(16)}")
print(f"The value of pi is approximately {math.pi:.5f}")

# Example using os library
import os
print(f"Current working directory: {os.getcwd()}")
# Uncomment to list files in current directory
# print("Files in current directory:", os.listdir())
`,
  java: `// Java starter code
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
        
        // Call a method
        String greeting = greet("Java Developer");
        System.out.println(greeting);
    }
    
    public static String greet(String name) {
        return "Hello, " + name + "!";
    }
}`,
  html: `<!DOCTYPE html>
<html>
<head>
    <title>My HTML Page</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        h1 {
            color: #2563eb;
        }
    </style>
</head>
<body>
    <h1>Hello, HTML!</h1>
    <p>This is a sample HTML page.</p>
</body>
</html>`,
  css: `/* CSS Styles */
body {
    font-family: Arial, sans-serif;
    background-color: #f9fafb;
    color: #111827;
    line-height: 1.5;
}

h1 {
    color: #2563eb;
    border-bottom: 2px solid #e5e7eb;
    padding-bottom: 10px;
}`,
  json: `{
  "name": "Sample Project",
  "version": "1.0.0",
  "description": "A sample JSON configuration"
}`
};

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
  const { currentUser, addProject, isLoading, error } = useStore();
  const [step, setStep] = useState<'template' | 'details'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [mainFileName, setMainFileName] = useState<string>('');
  const [localError, setLocalError] = useState<string | null>(null);

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (!currentUser) {
      navigate('/signin');
    }
  }, [currentUser, navigate]);

  // If still loading user data, show loading state
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

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
    setLocalError(null);
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

  const handleCreateProject = async () => {
    try {
      setLocalError(null);
      
      if (!projectName.trim()) {
        setLocalError('Project name is required');
        return;
      }
      
      if (!mainFileName.trim()) {
        setLocalError('Main file name is required');
        return;
      }
      
      const template = templates.find(t => t.id === selectedTemplate);
      if (!template) {
        setLocalError('Please select a template');
        return;
      }

      // Get starter code for selected language
      const starterCode = STARTER_CODE[selectedLanguage as keyof typeof STARTER_CODE] || '';

      // Create a single file with starter code
      const initialAssets: Asset[] = [
        {
          id: mainFileName,
          name: mainFileName,
          type: 'file',
          fileType: getFileTypeFromLanguage(selectedLanguage),
          lastModified: new Date().toISOString(),
          size: starterCode.length,
          content: starterCode,  // Add starter code
          metadata: {
            language: selectedLanguage
          }
        }
      ];

      await addProject({
        name: projectName.trim(),
        description: projectDescription.trim(),
        language: selectedLanguage,
        lastModified: new Date().toISOString().split('T')[0],
        stars: 0,
        initialFile: mainFileName,
        assets: initialAssets,
        visibility: 'public',
        ownerId: currentUser.id
      });

      // Navigate to the home page to see the new project
      navigate('/');
      
    } catch (err) {
      console.error('Failed to create project:', err);
      setLocalError('Failed to create project. Please try again.');
    }
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            {(error || localError) && (
              <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-md text-sm">
                {error || localError}
              </div>
            )}

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
                    className="btn-primary w-full flex justify-center items-center"
                    onClick={handleCreateProject}
                    disabled={!projectName.trim() || !mainFileName.trim() || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Project'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Project</h1>
      {renderStep()}
    </div>
  );
};