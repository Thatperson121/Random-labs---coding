import { WebSocketServer } from 'ws';
import { setupWSConnection } from 'y-websocket/bin/utils';
import http from 'http';
import { parse } from 'url';
import { config } from 'dotenv';

// Load environment variables
config();

const port = process.env.WS_PORT || 1234;
const server = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' });
  response.end('WebSocket server is running');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  const { query } = parse(req.url || '', true);
  const roomName = query.room as string;

  if (!roomName) {
    ws.close(1008, 'Room name is required');
    return;
  }

  setupWSConnection(ws, req, { roomName });
});

server.listen(port, () => {
  console.log(`WebSocket server is running on port ${port}`);
}); 