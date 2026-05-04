import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { ChatMessage } from '../models/chat-message.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WebsocketService implements OnDestroy {
  private ws: WebSocket | null = null;
  private messages$ = new Subject<ChatMessage>();
  private retryDelay = 1000;
  private maxRetry = 5000;

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;
    this.ws = new WebSocket(environment.wsUrl);

    this.ws.onmessage = (event) => {
      try {
        const data: ChatMessage = JSON.parse(event.data);
        this.messages$.next(data);
      } catch {}
    };

    this.ws.onclose = () => {
      setTimeout(() => {
        this.retryDelay = Math.min(this.retryDelay * 2, this.maxRetry);
        this.connect();
      }, this.retryDelay);
    };

    this.ws.onopen = () => { this.retryDelay = 1000; };
  }

  getMessages(): Observable<ChatMessage> {
    return this.messages$.asObservable();
  }

  send(pseudo: string, text: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'message', pseudo, text }));
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  disconnect(): void {
    this.ws?.close();
    this.ws = null;
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
