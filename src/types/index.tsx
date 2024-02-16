export interface IMessage {
    id: string;
    content: string;
    sender: string;
    timestamp: Date;
  }
  
  export interface IChannel {
    id: string;
    name: string;
    type: 'channel' | 'direct_message';
    participants: string[];
    messages: IMessage[];
  }