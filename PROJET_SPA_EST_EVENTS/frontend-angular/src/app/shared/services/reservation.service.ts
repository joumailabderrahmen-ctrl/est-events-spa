import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem, Reservation } from '../models/reservation.model';
import { StorageService } from './storage.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private api = `${environment.apiUrl}/reservations`;
  private cart$ = new BehaviorSubject<CartItem[]>([]);

  constructor(private http: HttpClient, private storage: StorageService) {
    const saved = this.storage.get<CartItem[]>('cart');
    if (saved) this.cart$.next(saved);
  }

  getCart(): Observable<CartItem[]> {
    return this.cart$.asObservable();
  }

  getCartSnapshot(): CartItem[] {
    return this.cart$.getValue();
  }

  addToCart(item: CartItem): void {
    const current = this.cart$.getValue();
    if (!current.find(i => i.eventId === item.eventId)) {
      const updated = [...current, item];
      this.cart$.next(updated);
      this.storage.set('cart', updated);
    }
  }

  removeFromCart(eventId: string): void {
    const updated = this.cart$.getValue().filter(i => i.eventId !== eventId);
    this.cart$.next(updated);
    this.storage.set('cart', updated);
  }

  clearCart(): void {
    this.cart$.next([]);
    this.storage.remove('cart');
  }

  getTotal(): number {
    return this.cart$.getValue().reduce((sum, i) => sum + i.price, 0);
  }

  createReservation(data: Reservation): Observable<Reservation> {
    return this.http.post<Reservation>(this.api, data);
  }

  getAll(email?: string): Observable<Reservation[]> {
    const url = email ? `${this.api}?email=${email}` : this.api;
    return this.http.get<Reservation[]>(url);
  }
}
