import { Component, OnInit } from '@angular/core';
import { EventService } from '../shared/services/event.service';
import { ReservationService } from '../shared/services/reservation.service';
import { Event } from '../shared/models/event.model';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrl: './events.component.scss'
})
export class EventsComponent implements OnInit {
  allEvents: Event[] = [];
  filteredEvents: Event[] = [];
  loading = true;
  searchText = '';
  activeCategory = 'all';
  activePriceFilter = 'all';

  categories = [
    { key: 'all',     label: 'Tous' },
    { key: 'tech',    label: 'Tech' },
    { key: 'culture', label: 'Culture' },
    { key: 'sport',   label: 'Sport' },
    { key: 'science', label: 'Science' },
    { key: 'music',   label: 'Musique' },
    { key: 'autre',   label: 'Autre' }
  ];

  categoryImages: Record<string, string> = {
    tech:    'assets/images/event-tech.jpg',
    culture: 'assets/images/event-culture.jpg',
    sport:   'assets/images/event-sport.jpg',
    science: 'assets/images/event-science.jpg',
    music:   'assets/images/event-music.jpg',
    autre:   'assets/images/event-default.jpg'
  };

  categoryPlaceholders: Record<string, string> = {
    tech:    'https://picsum.photos/seed/tech/600/400',
    culture: 'https://picsum.photos/seed/culture/600/400',
    sport:   'https://picsum.photos/seed/sport/600/400',
    science: 'https://picsum.photos/seed/science/600/400',
    music:   'https://picsum.photos/seed/music/600/400',
    autre:   'https://picsum.photos/seed/event/600/400'
  };

  constructor(
    private eventService: EventService,
    private reservationService: ReservationService
  ) {}

  ngOnInit(): void {
    this.eventService.getAll().subscribe(events => {
      this.allEvents = events;
      this.applyFilters();
      this.loading = false;
    });
  }

  applyFilters(): void {
    let result = [...this.allEvents];

    if (this.activeCategory !== 'all') {
      result = result.filter(e => e.category === this.activeCategory);
    }
    if (this.activePriceFilter === 'free') {
      result = result.filter(e => e.isFree);
    } else if (this.activePriceFilter === 'paid') {
      result = result.filter(e => !e.isFree);
    }
    if (this.searchText.trim()) {
      const q = this.searchText.toLowerCase();
      result = result.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q)
      );
    }
    this.filteredEvents = result;
  }

  setCategory(key: string): void {
    this.activeCategory = key;
    this.applyFilters();
  }

  setPriceFilter(filter: string): void {
    this.activePriceFilter = filter;
    this.applyFilters();
  }

  getImage(event: Event): string {
    if (event.image && /event-\d+\.(jpg|jpeg|png|webp)$/i.test(event.image))
      return `http://localhost:3000/uploads/${event.image}`;
    return this.categoryImages[event.category] || this.categoryPlaceholders[event.category];
  }

  onImageError(event: any, category: string): void {
    event.target.src = this.categoryPlaceholders[category] || 'https://picsum.photos/seed/event/600/400';
  }

  getCategoryLabel(cat: string): string {
    return this.categories.find(c => c.key === cat)?.label || cat;
  }
}
