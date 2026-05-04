const { WebSocketServer } = require('ws');

const history = [];
const MAX_HISTORY = 20;

function initWebSocket(server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    ws.send(JSON.stringify({ type: 'history', messages: history }));

    ws.on('message', (raw) => {
      let data;
      try { data = JSON.parse(raw); } catch { return; }

      if (data.type === 'message' && data.pseudo && data.text) {
        const msg = {
          type:      'message',
          pseudo:    data.pseudo.slice(0, 30),
          text:      data.text.slice(0, 500),
          timestamp: new Date().toISOString()
        };
        history.push(msg);
        if (history.length > MAX_HISTORY) history.shift();

        wss.clients.forEach((client) => {
          if (client.readyState === 1) client.send(JSON.stringify(msg));
        });
      }
    });

    ws.on('close', () => {
      broadcastActiveCount(wss);
    });

    broadcastActiveCount(wss);
  });

  return wss;
}

function broadcastActiveCount(wss) {
  const count = [...wss.clients].filter(c => c.readyState === 1).length;
  const msg = JSON.stringify({ type: 'activeCount', count });
  wss.clients.forEach(c => { if (c.readyState === 1) c.send(msg); });
}

module.exports = { initWebSocket };
