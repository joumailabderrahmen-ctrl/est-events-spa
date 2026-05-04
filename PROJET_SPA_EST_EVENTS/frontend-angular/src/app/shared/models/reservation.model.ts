export interface CartItem {
  eventId: string;
  title: string;
  price: number;
  image: string;
  category: string;
}

export interface Reservation {
  _id?: string;
  studentName: string;
  studentEmail: string;
  events: { eventId: string; title: string; price: number }[];
  total: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt?: string;
}
