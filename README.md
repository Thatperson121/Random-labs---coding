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

3. Set up environment variables
   - Copy `.env.example` to `.env.local`
   ```bash
   cp .env.example .env.local
   ```
   - Edit `.env.local` and add your actual API keys and configuration

4. Start the development server
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

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
   - Build command: `CI= npm run build`
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

### Troubleshooting Netlify Deployment Issues

If you encounter build errors on Netlify, try the following:

1. **Check build logs**: In the Netlify dashboard, go to the failed deploy and check the detailed logs to identify the specific error.

2. **Environment variables**: Ensure all required environment variables are set in the Netlify dashboard under Site settings > Build & deploy > Environment.

3. **Node.js version**: This project is configured to use Node.js 18. If you need a different version, update the `NODE_VERSION` in `netlify.toml`.

4. **Build command flag**: The `CI=` prefix in the build command helps prevent some CI-specific errors.

5. **Redirects**: For SPA routing, this project includes both a `_redirects` file and Netlify configuration to handle client-side routing.

6. **Clear cache**: If you've made configuration changes, try clearing the Netlify build cache:
   - Go to Site settings > Build & deploy > Continuous Deployment
   - Click "Clear cache and deploy site"

## Environment Variables

This project uses environment variables to manage API keys and configuration. In Netlify, you can set these in the site dashboard:

1. Go to **Site settings** > **Build & deploy** > **Environment**
2. Add the following environment variables:
   - `VITE_API_KEY`: Your API key (will be kept secure)
   - `VITE_API_URL`: The URL for your API (if applicable)
   - `VITE_STORAGE_PREFIX`: Storage prefix for local data (optional)

Environment variables are prefixed with `VITE_` to make them accessible in the frontend code through `import.meta.env.VITE_VARIABLE_NAME`.

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