export interface Message {
  user: string;
  time: string;
  content: string;
  serverName?: string;
  profileImage: string;
}

export interface ServerProps {
  name: string;
  messages: Message[];
  iconColor?: string;
}
