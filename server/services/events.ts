import { Response } from 'express';

export interface DashboardEvent {
  type: 
    | 'connected'
    | 'admission_created'
    | 'admission_updated'
    | 'admission_deleted'
    | 'message_created'
    | 'message_updated'
    | 'message_deleted'
    | 'stats_updated';
  data?: any;
  timestamp?: string;
  stats?: Record<string, any>;
}

class EventBroadcaster {
  private clients: Set<Response> = new Set();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Send keepalive heartbeat every 20 seconds so proxies/browsers don't drop the connection
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, 20000);
  }

  public addClient(res: Response): void {
    this.clients.add(res);

    // Initial handshake
    const initialPayload: DashboardEvent = {
      type: 'connected',
      timestamp: new Date().toISOString(),
      data: { clientCount: this.clients.size },
    };
    res.write(`data: ${JSON.stringify(initialPayload)}\n\n`);

    res.on('close', () => {
      this.clients.delete(res);
    });
  }

  public broadcast(event: DashboardEvent): void {
    const payload: DashboardEvent = {
      ...event,
      timestamp: event.timestamp || new Date().toISOString(),
    };
    const message = `data: ${JSON.stringify(payload)}\n\n`;

    for (const client of this.clients) {
      try {
        client.write(message);
      } catch (err) {
        this.clients.delete(client);
      }
    }
  }

  private sendHeartbeat(): void {
    for (const client of this.clients) {
      try {
        client.write(': heartbeat\n\n');
      } catch {
        this.clients.delete(client);
      }
    }
  }

  public getClientCount(): number {
    return this.clients.size;
  }
}

export const eventBroadcaster = new EventBroadcaster();
