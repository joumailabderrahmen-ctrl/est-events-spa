export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
