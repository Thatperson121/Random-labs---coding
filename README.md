# Full-Featured Collaborative Browser IDE

This project is a fully-featured, collaborative Integrated Development Environment (IDE) designed to run directly in your web browser. It brings together real-time collaborative editing, AI-powered code assistance, direct code execution, and Firebase integration for seamless project management and sharing. This README will guide you through the process of local development and deploying your own instance of the IDE on Netlify.

## New Features

*   **Built in Libraries:** Access to a wide range of libraries is integrated directly into the IDE. This allows for importing dependencies without needing external tools or configurations.
*   **Enhanced Code Execution:** The code execution capabilities have been significantly improved, allowing for complex script execution.
*   **Improved UI/UX:** The user interface has been refined to provide a more intuitive and efficient development experience.
* **AI code assistance**: AI tools are now integrated to help writing and debugging code.
* **Asset Panel**: The asset panel allows you to manage your project files and open files in the editor.
*   **Firebase Integration:** Users can now log in, sign up, save, and load projects directly to and from Firebase.
*   **Project Sharing:** Users can share their projects with others through Firebase, enabling a collaborative coding environment.
* **User Projects:** Users can now view all of their projects on the home page.
* **Explore other code:** Using AI assistance you can now view other users code and add it to your projects.

## Key Features

-   **Firebase User Authentication:** Secure user login and sign-up with Firebase.
-   **Real-Time Collaborative Editing:** Multiple users can edit the same project simultaneously.
- AI code assistance
- Code execution
- Built-in server capabilities
- Built in libraries
- Modern UI with Monaco Editor
- WebSocket-based real-time updates
- Asset Panel
- User projects

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn.
- Netlify account (for deployment)

## Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/collaborative-browser-ide.git
   cd collaborative-browser-ide
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment files:
   ```bash
   cp .env.example .env
   cp .env.example .env.production
   ```

4. Update the environment variables in `.env` and `.env.production`

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Start the WebSocket server:
   ```bash
   npm run server
   ```

## Deployment to Netlify

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. Connect your GitHub repository to Netlify:
   - Go to [Netlify](https://app.netlify.com)
   - Click "New site from Git"
   - Choose GitHub
   - Select your repository
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`

3. Set up environment variables in Netlify:
   - Go to Site settings > Build & deploy > Environment
   - Add all variables from `.env.production`

4. Deploy:
   - Netlify will automatically deploy when you push to the main branch
   - Or click "Trigger deploy" in the Netlify dashboard

## Environment Variables

Required environment variables:

```env
# API Configuration
VITE_API_KEY=your_api_key
VITE_API_URL=your_api_url

# WebSocket Configuration
VITE_WS_URL=your_websocket_url

# Feature Flags
VITE_ENABLE_COLLABORATION=true
VITE_ENABLE_AI_ASSISTANT=true
VITE_ENABLE_CODE_EXECUTION=true

# Security
VITE_MAX_EXECUTION_TIME=30000
VITE_ALLOWED_ORIGINS=your_domain

# Development Settings
VITE_DEBUG_MODE=false
VITE_LOG_LEVEL=info
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

[Edit in StackBlitz next generation editor ⚡️](https://stackblitz.com/~/github.com/Thatperson121/Random-labs---coding)