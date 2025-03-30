declare module 'yjs' {
  export class Doc {
    constructor();
    getText(name: string): YText;
  }

  export class YText {
    constructor();
    insert(index: number, content: string): void;
    delete(index: number, length: number): void;
    toString(): string;
  }
}

declare module 'y-websocket' {
  import { Doc } from 'yjs';

  export class WebsocketProvider {
    constructor(
      url: string,
      roomName: string,
      doc: Doc
    );
    awareness: any;
    destroy(): void;
  }
}

declare module 'y-monaco' {
  import * as monaco from 'monaco-editor';
  import { YText } from 'yjs';

  export class MonacoBinding {
    constructor(
      ytext: YText,
      editorModel: monaco.editor.ITextModel,
      editors: Set<monaco.editor.IStandaloneCodeEditor>,
      awareness: any
    );
  }
} 