export interface ChatMessage {
  type: 'message' | 'history' | 'activeCount';
  pseudo?: string;
  text?: string;
  timestamp?: string;
  messages?: ChatMessage[];
  count?: number;
}
