import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../shared/services/event.service';
import { ReservationService } from '../../shared/services/reservation.service';
import { Event } from '../../shared/models/event.model';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrl: './event-detail.component.scss'
})
export class EventDetailComponent implements OnInit {
  event: Event | null = null;
  loading = true;
  notFound = false;
  toastVisible = false;
  toastMessage = '';
  alreadyInCart = false;
  remaining: number | null = null;

  categoryPlaceholders: Record<string, string> = {
    tech:    'https://picsum.photos/seed/tech/900/500',
    culture: 'https://picsum.photos/seed/culture/900/500',
    sport:   'https://picsum.photos/seed/sport/900/500',
    science: 'https://picsum.photos/seed/science/900/500',
    music:   'https://picsum.photos/seed/music/900/500',
    autre:   'https://picsum.photos/seed/event/900/500'
  };

  categoryLabels: Record<string, string> = {
    tech: 'Tech', culture: 'Culture', sport: 'Sport',
    science: 'Science', music: 'Musique', autre: 'Autre'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private reservationService: ReservationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.eventService.getById(id).subscribe({
      next: (event) => {
        this.event = event;
        this.loading = false;
        this.alreadyInCart = this.reservationService
          .getCartSnapshot().some(i => i.eventId === event._id);
        this.eventService.getCapacity(event._id).subscribe(c => this.remaining = c.remaining);
      },
      error: () => { this.notFound = true; this.loading = false; }
    });
  }

  addToCart(): void {
    if (!this.event || this.alreadyInCart) return;
    this.reservationService.addToCart({
      eventId: this.event._id,
      title:   this.event.title,
      price:   this.event.price,
      image:   this.getImage(this.event),
      category: this.event.category
    });
    this.alreadyInCart = true;
    this.showToast(`"${this.event.title}" ajouté au panier !`);
  }

  getImage(event: Event): string {
    if (event.image && /event-\d+\.(jpg|jpeg|png|webp)$/i.test(event.image))
      return `http://localhost:3000/uploads/${event.image}`;
    return `assets/images/event-${event.category}.jpg`;
  }

  onImageError(e: any): void {
    if (this.event) e.target.src = this.categoryPlaceholders[this.event.category];
  }

  showToast(msg: string): void {
    this.toastMessage = msg;
    this.toastVisible = true;
    setTimeout(() => this.toastVisible = false, 3000);
  }

  getCategoryLabel(cat: string): string {
    return this.categoryLabels[cat] || cat;
  }
}
