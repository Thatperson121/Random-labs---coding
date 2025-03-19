import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code2, ThumbsUp, GitFork, Users, Trophy } from 'lucide-react';
import { useStore } from '../store/useStore';

const EXAMPLE_PROJECTS = [
  {
    id: '1',
    name: 'Snake Game',
    description: 'Classic Snake game built with JavaScript and Canvas',
    language: 'JavaScript',
    likes: 156,
    ownerId: 'random-labs',
    visibility: 'public',
    collaborators: [],
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-15'),
    code: `const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let snake = [{x: 10, y: 10}];
let food = {x: 15, y: 15};
let dx = 1;
let dy = 0;

function gameLoop() {
  setTimeout(() => {
    clearCanvas();
    moveSnake();
    drawFood();
    drawSnake();
    gameLoop();
  }, 100);
}

gameLoop();`,
  },
  {
    id: '2',
    name: 'Weather Dashboard',
    description: 'Real-time weather dashboard using OpenWeather API',
    language: 'TypeScript',
    likes: 89,
    ownerId: 'random-labs',
    visibility: 'public',
    collaborators: [],
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-12'),
    code: `interface Weather {
  temp: number;
  humidity: number;
  description: string;
}

async function getWeather(city: string): Promise<Weather> {
  const response = await fetch(
    \`https://api.openweathermap.org/data/2.5/weather?q=\${city}&units=metric\`
  );
  const data = await response.json();
  return {
    temp: data.main.temp,
    humidity: data.main.humidity,
    description: data.weather[0].description,
  };
}`,
  },
  {
    id: '3',
    name: 'Markdown Editor',
    description: 'Live markdown editor with preview',
    language: 'TypeScript',
    likes: 234,
    ownerId: 'random-labs',
    visibility: 'public',
    collaborators: [],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-05'),
    code: `import { marked } from 'marked';

interface EditorState {
  markdown: string;
  html: string;
}

function Editor() {
  const [state, setState] = useState<EditorState>({
    markdown: '# Hello World',
    html: marked('# Hello World')
  });

  const handleChange = (text: string) => {
    setState({
      markdown: text,
      html: marked(text)
    });
  };
}`,
  },
];

const LanguageColors: Record<string, string> = {
  JavaScript: 'bg-yellow-500',
  TypeScript: 'bg-blue-500',
  Python: 'bg-green-500',
  HTML: 'bg-orange-500',
  CSS: 'bg-pink-500',
};

export function HomePage() {
  const navigate = useNavigate();
  const { currentUser, projects, loginAsGuest, setProject } = useStore();
  const allProjects = [...EXAMPLE_PROJECTS, ...projects].sort((a, b) => b.likes - a.likes);

  const handleGuestAccess = () => {
    loginAsGuest();
    navigate('/');
  };

  const handleProjectClick = (project: typeof EXAMPLE_PROJECTS[0]) => {
    setProject(project);
    navigate(`/project/${project.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Welcome to CodeCollab</h1>
          <p className="text-xl text-gray-600 mb-8">
            Create, collaborate, and share your coding projects in real-time
          </p>
          {!currentUser && (
            <div className="space-x-4">
              <Link
                to="/signup"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
              >
                Get Started
              </Link>
              <button
                onClick={handleGuestAccess}
                className="bg-gray-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-900"
              >
                Try as Guest
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900">Top Projects</h2>
          </div>
          {currentUser && (
            <Link
              to="/new-project"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center space-x-2"
            >
              <span>New Project</span>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => handleProjectClick(project)}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Code2 className="w-6 h-6 text-gray-600" />
                  <div>
                    <h3 className="font-semibold text-lg">{project.name}</h3>
                    <p className="text-sm text-gray-500">{project.description}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <div className={`w-3 h-3 rounded-full ${LanguageColors[project.language]}`} />
                  <span>{project.language}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{project.likes}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{project.collaborators.length}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <GitFork className="w-4 h-4" />
                  <span>0</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}