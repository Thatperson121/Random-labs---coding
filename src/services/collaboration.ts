import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';
import * as monaco from 'monaco-editor';
import { User } from '../types';

class CollaborationService {
  private doc: Y.Doc;
  private wsProvider: WebsocketProvider | null = null;
  private awareness: any = null;
  private editor: monaco.editor.IStandaloneCodeEditor | null = null;
  private currentUser: User | null = null;

  constructor() {
    this.doc = new Y.Doc();
  }

  connect(projectId: string, user: User) {
    this.currentUser = user;
    
    // Get WebSocket URL from environment variables with fallback
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:1234';
    
    // Connect to WebSocket server
    this.wsProvider = new WebsocketProvider(
      wsUrl,
      projectId,
      this.doc
    );

    // Set up awareness for cursor positions
    this.awareness = this.wsProvider.awareness;
    this.awareness.setLocalState({
      user: {
        name: user.name,
        color: user.color,
        cursor: null
      }
    });

    // Handle cursor updates
    this.awareness.on('update', () => {
      const states = Array.from(this.awareness.getStates().values());
      // Update cursor positions in the editor
      if (this.editor) {
        // Implementation for updating cursor positions
      }
    });
  }

  bindEditor(editor: monaco.editor.IStandaloneCodeEditor) {
    this.editor = editor;
    
    if (this.wsProvider) {
      // Create a YText type for the editor content
      const ytext = this.doc.getText('monaco');
      
      // Bind the Monaco editor to the YText
      new MonacoBinding(
        ytext,
        editor.getModel()!,
        new Set([editor]),
        this.awareness
      );
    }
  }

  updateCursor(position: { line: number; column: number }) {
    if (this.awareness && this.currentUser) {
      this.awareness.setLocalState({
        user: {
          ...this.awareness.getLocalState().user,
          cursor: position
        }
      });
    }
  }

  disconnect() {
    if (this.wsProvider) {
      this.wsProvider.destroy();
      this.wsProvider = null;
    }
    this.awareness = null;
    this.editor = null;
    this.currentUser = null;
  }
}

export const collaborationService = new CollaborationService(); 