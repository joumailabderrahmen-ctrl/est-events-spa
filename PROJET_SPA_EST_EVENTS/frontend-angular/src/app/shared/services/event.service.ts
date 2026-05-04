import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event } from '../models/event.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EventService {
  private api = `${environment.apiUrl}/events`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Event[]> {
    return this.http.get<Event[]>(this.api);
  }

  getById(id: string): Observable<Event> {
    return this.http.get<Event>(`${this.api}/${id}`);
  }

  create(event: Partial<Event>): Observable<Event> {
    return this.http.post<Event>(this.api, event);
  }

  update(id: string, event: Partial<Event>): Observable<Event> {
    return this.http.put<Event>(`${this.api}/${id}`, event);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.api}/${id}`);
  }

  getCapacity(id: string): Observable<{ capacity: number; taken: number; remaining: number }> {
    return this.http.get<any>(`${this.api}/${id}/capacity`);
  }

  getStats(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/stats`);
  }
}
