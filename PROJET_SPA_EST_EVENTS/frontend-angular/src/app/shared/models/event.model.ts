export interface Event {
  _id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  date: string;
  location: string;
  category: 'tech' | 'culture' | 'sport' | 'science' | 'music' | 'autre';
  capacity: number;
  isFree: boolean;
  createdAt: string;
}
