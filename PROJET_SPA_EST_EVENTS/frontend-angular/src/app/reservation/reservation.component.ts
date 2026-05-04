import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { EventService } from '../shared/services/event.service';
import { ReservationService } from '../shared/services/reservation.service';
import { Event } from '../shared/models/event.model';
import { CartItem } from '../shared/models/reservation.model';

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrl: './reservation.component.scss'
})
export class ReservationComponent implements OnInit, OnDestroy {
  availableEvents: Event[] = [];
  cart: CartItem[] = [];
  form: FormGroup;

  isDragOver = false;
  draggedEventId: string | null = null;

  submitting = false;
  toastVisible = false;
  toastMessage = '';
  toastType: 'success' | 'danger' = 'success';

  private sub!: Subscription;

  categoryPlaceholders: Record<string, string> = {
    tech:    'https://picsum.photos/seed/tech/300/200',
    culture: 'https://picsum.photos/seed/culture/300/200',
    sport:   'https://picsum.photos/seed/sport/300/200',
    science: 'https://picsum.photos/seed/science/300/200',
    music:   'https://picsum.photos/seed/music/300/200',
    autre:   'https://picsum.photos/seed/event/300/200'
  };

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    public reservationService: ReservationService
  ) {
    this.form = this.fb.group({
      studentName:  ['', [Validators.required, Validators.minLength(2)]],
      studentEmail: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.eventService.getAll().subscribe(events => {
      this.availableEvents = events;
    });
    this.sub = this.reservationService.getCart().subscribe(cart => {
      this.cart = cart;
    });
  }

  /* ── DRAG & DROP ── */
  onDragStart(event: DragEvent, eventId: string): void {
    this.draggedEventId = eventId;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'copy';
      event.dataTransfer.setData('text/plain', eventId);
    }
    const target = event.target as HTMLElement;
    setTimeout(() => target.classList.add('dragging'), 0);
  }

  onDragEnd(event: DragEvent): void {
    const target = event.target as HTMLElement;
    target.classList.remove('dragging');
    this.draggedEventId = null;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
    this.isDragOver = true;
  }

  onDragEnter(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    const target = event.currentTarget as HTMLElement;
    const related = event.relatedTarget as Node;
    if (!target.contains(related)) this.isDragOver = false;
  }

  addEventToCart(eventId: string): void {
    const evt = this.availableEvents.find(e => e._id === eventId);
    if (!evt || this.isInCart(eventId)) return;
    this.reservationService.addToCart({
      eventId:  evt._id,
      title:    evt.title,
      price:    evt.price,
      image:    `assets/images/event-${evt.category}.jpg`,
      category: evt.category
    });
    this.showToast(`"${evt.title}" ajouté au panier !`, 'success');
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    const id = event.dataTransfer?.getData('text/plain') || this.draggedEventId;
    if (!id) return;
    const evt = this.availableEvents.find(e => e._id === id);
    if (!evt) return;
    if (this.cart.some(i => i.eventId === id)) {
      this.showToast('Cet événement est déjà dans le panier.', 'danger');
      return;
    }
    this.reservationService.addToCart({
      eventId:  evt._id,
      title:    evt.title,
      price:    evt.price,
      image:    `assets/images/event-${evt.category}.jpg`,
      category: evt.category
    });
    this.showToast(`"${evt.title}" ajouté au panier !`, 'success');
  }

  removeFromCart(eventId: string): void {
    this.reservationService.removeFromCart(eventId);
  }

  getTotal(): number {
    return this.reservationService.getTotal();
  }

  isInCart(eventId: string): boolean {
    return this.cart.some(i => i.eventId === eventId);
  }

  /* ── FORMULAIRE ── */
  onSubmit(): void {
    if (this.form.invalid || this.cart.length === 0) {
      this.form.markAllAsTouched();
      if (this.cart.length === 0) this.showToast('Ajoutez au moins un événement au panier.', 'danger');
      return;
    }
    this.submitting = true;
    const payload = {
      studentName:  this.form.value.studentName,
      studentEmail: this.form.value.studentEmail,
      events: this.cart.map(i => ({ eventId: i.eventId, title: i.title, price: i.price })),
      total:  this.getTotal(),
      status: 'pending' as const
    };
    this.reservationService.createReservation(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.reservationService.clearCart();
        this.form.reset();
        this.showToast('Réservation confirmée ! Vous recevrez une confirmation par email.', 'success');
      },
      error: () => {
        this.submitting = false;
        this.showToast('Erreur lors de la réservation. Veuillez réessayer.', 'danger');
      }
    });
  }

  showToast(msg: string, type: 'success' | 'danger'): void {
    this.toastMessage = msg;
    this.toastType = type;
    this.toastVisible = true;
    setTimeout(() => this.toastVisible = false, 4000);
  }

  getImage(item: CartItem): string {
    return item.image || `assets/images/event-${item.category}.jpg`;
  }

  onImgError(e: any, category: string): void {
    e.target.src = this.categoryPlaceholders[category] || 'https://picsum.photos/seed/event/300/200';
  }

  fieldInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
