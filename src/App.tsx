import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Split from 'react-split';
import { Header } from './components/Header';
import { CodeEditor } from './components/Editor';
import { AIAssistant } from './components/AIAssistant';
import { AssetPanel } from './components/AssetPanel';
import { HomePage } from './pages/HomePage';
import { NewProject } from './pages/NewProject';

function ProjectEditor() {
  return (
    <div className="flex-1 flex flex-col">
      <Split
        className="flex-1 flex"
        sizes={[75, 25]}
        minSize={[400, 200]}
        gutterSize={4}
        gutterStyle={() => ({
          backgroundColor: '#e5e7eb',
          cursor: 'col-resize',
        })}
      >
        <CodeEditor />
        <AssetPanel />
      </Split>
      <AIAssistant />
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="h-screen flex flex-col bg-gray-50">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/new-project" element={<NewProject />} />
          <Route path="/project/:id" element={<ProjectEditor />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;