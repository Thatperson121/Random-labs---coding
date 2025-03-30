import { Handler } from '@netlify/functions';
import { WebSocketServer } from 'ws';
import { setupWSConnection } from 'y-websocket/bin/utils';
import { HandlerEvent, HandlerContext } from '@netlify/functions';

// Initialize WebSocket server
const wss = new WebSocketServer({ noServer: true });

// Handle WebSocket upgrade
const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Check if this is a WebSocket upgrade request
  if (event.headers['upgrade'] === 'websocket') {
    try {
      // Get room name from query parameters
      const roomName = event.queryStringParameters?.room;

      if (!roomName) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Room name is required' })
        };
      }

      // Set up WebSocket connection
      const socket = await new Promise((resolve, reject) => {
        wss.handleUpgrade(event, event.headers, event.body, (ws) => {
          setupWSConnection(ws, event, { roomName });
          resolve(ws);
        });
      });

      return {
        statusCode: 101,
        headers: {
          'Upgrade': 'websocket',
          'Connection': 'Upgrade'
        }
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to establish WebSocket connection' })
      };
    }
  }

  // Handle regular HTTP requests
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'WebSocket server is running' })
  };
};

export { handler }; 