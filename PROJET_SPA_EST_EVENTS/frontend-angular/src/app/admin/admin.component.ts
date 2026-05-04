import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { EventService } from '../shared/services/event.service';
import { Event as EstEvent } from '../shared/models/event.model';
import { environment } from '../../environments/environment';

interface Reservation {
  _id: string;
  studentName: string;
  studentEmail: string;
  events: { title: string; price: number }[];
  total: number;
  status: string;
  createdAt: string;
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  activeTab: 'events' | 'reservations' = 'events';
  events: EstEvent[] = [];
  reservations: Reservation[] = [];
  loading = false;
  toast = '';
  toastType: 'success' | 'danger' = 'success';

  form: FormGroup;
  editingId: string | null = null;
  selectedFile: File | null = null;
  showForm = false;
  categories = ['tech','culture','sport','science','music','autre'];

  private apiUrl = environment.apiUrl;

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private http: HttpClient
  ) {
    this.form = this.fb.group({
      title:       ['', Validators.required],
      description: [''],
      date:        ['', Validators.required],
      location:    [''],
      price:       [0, [Validators.min(0)]],
      capacity:    [100, [Validators.min(1)]],
      category:    ['tech']
    });
  }

  ngOnInit(): void {
    this.loadEvents();
    this.loadReservations();
  }

  loadEvents(): void {
    this.loading = true;
    this.eventService.getAll().subscribe({
      next: (e) => { this.events = e; this.loading = false; },
      error: () => this.loading = false
    });
  }

  loadReservations(): void {
    this.http.get<Reservation[]>(`${this.apiUrl}/reservations`).subscribe({
      next: (r) => this.reservations = r
    });
  }

  openCreate(): void {
    this.editingId = null;
    this.form.reset({ price: 0, capacity: 100, category: 'tech' });
    this.selectedFile = null;
    this.showForm = true;
  }

  openEdit(event: EstEvent): void {
    this.editingId = event._id;
    const dateStr = event.date ? new Date(event.date).toISOString().slice(0, 16) : '';
    this.form.patchValue({ ...event, date: dateStr });
    this.selectedFile = null;
    this.showForm = true;
  }

  onFileChange(e: Event): void {
    const input = e.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] || null;
  }

  submit(): void {
    if (this.form.invalid) return;
    const fd = new FormData();
    Object.entries(this.form.value).forEach(([k, v]) => fd.append(k, String(v)));
    if (this.selectedFile) fd.append('image', this.selectedFile);

    const req$ = this.editingId
      ? this.http.put(`${this.apiUrl}/events/${this.editingId}`, fd)
      : this.http.post(`${this.apiUrl}/events`, fd);

    req$.subscribe({
      next: () => {
        this.showToast(this.editingId ? 'Événement modifié' : 'Événement créé', 'success');
        this.showForm = false;
        this.loadEvents();
      },
      error: (e) => this.showToast(e.error?.message || 'Erreur', 'danger')
    });
  }

  deleteEvent(id: string): void {
    if (!confirm('Supprimer cet événement ?')) return;
    this.http.delete(`${this.apiUrl}/events/${id}`).subscribe({
      next: () => { this.showToast('Événement supprimé', 'success'); this.loadEvents(); },
      error: (e) => this.showToast(e.error?.message || 'Erreur', 'danger')
    });
  }

  confirmReservation(id: string): void {
    this.http.patch(`${this.apiUrl}/reservations/${id}/confirm`, {}).subscribe({
      next: () => { this.showToast('Réservation confirmée', 'success'); this.loadReservations(); },
      error: () => this.showToast('Erreur', 'danger')
    });
  }

  cancelReservation(id: string): void {
    this.http.patch(`${this.apiUrl}/reservations/${id}/cancel`, {}).subscribe({
      next: () => { this.showToast('Réservation annulée', 'success'); this.loadReservations(); },
      error: () => this.showToast('Erreur', 'danger')
    });
  }

  statusBadge(status: string): string {
    return { pending: 'warning', confirmed: 'success', cancelled: 'danger' }[status] || 'secondary';
  }

  getEventImage(event: EstEvent): string {
    if (!event.image) return `https://picsum.photos/seed/${event._id}/60/40`;
    // Multer uploads : nom avec timestamp numérique ex: event-1777863122482.png
    if (/event-\d+\.(jpg|jpeg|png|webp)$/i.test(event.image)) {
      return `http://localhost:3000/uploads/${event.image}`;
    }
    // Images statiques du seed ex: event-tech.jpg
    return `assets/images/${event.image}`;
  }

  private showToast(msg: string, type: 'success' | 'danger'): void {
    this.toast = msg;
    this.toastType = type;
    setTimeout(() => this.toast = '', 3000);
  }
}
