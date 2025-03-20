# Collaborative Browser IDE

A browser-based collaborative coding environment with real-time collaboration, multi-language support, and interactive code execution.

## Features

- Browser-based code editor with syntax highlighting and code completion
- Multi-language support (JavaScript, TypeScript, Python, Java, HTML, CSS, JSON)
- Real-time code execution and preview
- Built-in terminal and console
- Project management and sharing
- User authentication system
- Responsive design works on desktop and mobile

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm 9 or later

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/collaborative-browser-ide.git
cd collaborative-browser-ide
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Building for Production

To build the application for production:

```bash
npm run build
```

This will create a `dist` directory with the compiled assets.

## Deployment to Netlify

This project is configured for easy deployment to Netlify. You can deploy in two ways:

### Option 1: Connect to your GitHub repository

1. Push your code to a GitHub repository
2. Log in to Netlify and click "New site from Git"
3. Choose GitHub and select your repository
4. Use the following settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Click "Deploy site"

### Option 2: Manual deployment

1. Build your project locally
```bash
npm run build
```

2. Install the Netlify CLI
```bash
npm install -g netlify-cli
```

3. Login to Netlify
```bash
netlify login
```

4. Deploy the site
```bash
netlify deploy --prod
```

## Technologies Used

- React 18
- Vite
- TypeScript
- Monaco Editor
- Tailwind CSS
- Zustand for state management

## License

This project is licensed under the MIT License - see the LICENSE file for details.

[Edit in StackBlitz next generation editor ⚡️](https://stackblitz.com/~/github.com/Thatperson121/Random-labs---coding)