import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { EventService } from '../shared/services/event.service';
import { Event } from '../shared/models/event.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('audioPlayer') audioRef!: ElementRef<HTMLAudioElement>;

  stats = { totalEvents: 0, freeEvents: 0, totalReservations: 0, byCategory: [] as any[] };
  upcomingEvents: Event[] = [];
  isAudioPlaying = false;
  animatedStats = { events: 0, free: 0, reservations: 0, categories: 0 };
  loading = true;

  testimonials = [
    { name: 'Fatima Zahra', filiere: 'CDL 2ème année', text: 'La plateforme EST Events m\'a permis de ne manquer aucun événement du campus. Simple, rapide et efficace !', avatar: 'FZ' },
    { name: 'Mohammed Amine', filiere: 'GI 1ère année', text: 'La réservation en ligne est un vrai gain de temps. J\'ai pu m\'inscrire au hackathon en 2 minutes.', avatar: 'MA' },
    { name: 'Salma Benali', filiere: 'CDL 3ème année', text: 'Super interface ! Le système de panier est très pratique pour réserver plusieurs événements en une fois.', avatar: 'SB' }
  ];

  features = [
    { image: 'assets/images/feature-card-1.jpg', icon: 'bi-calendar-event', title: 'Événements variés', desc: 'Conférences, hackathons, tournois sportifs, soirées culturelles... Un calendrier riche et diversifié.' },
    { image: 'assets/images/feature-card-2.jpg', icon: 'bi-ticket-perforated', title: 'Réservation facile', desc: 'Glissez-déposez vos événements dans le panier et confirmez votre inscription en quelques clics.' },
    { image: 'assets/images/feature-card-3.jpg', icon: 'bi-people', title: 'Communauté active', desc: 'Rejoignez la communauté estudiantine de l\'EST Dakhla et connectez-vous avec vos camarades.' }
  ];

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.eventService.getStats().subscribe(data => {
      this.stats = data;
      this.animateCounters(data);
    });
    this.eventService.getAll().subscribe(events => {
      this.upcomingEvents = events
        .filter(e => new Date(e.date) >= new Date())
        .slice(0, 3);
      this.loading = false;
    });
  }

  private animateCounters(data: any): void {
    const targets = {
      events: data.totalEvents,
      free: data.freeEvents,
      reservations: data.totalReservations,
      categories: data.byCategory?.length || 0
    };
    const duration = 1500;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      this.animatedStats.events       = Math.round(targets.events * progress);
      this.animatedStats.free         = Math.round(targets.free * progress);
      this.animatedStats.reservations = Math.round(targets.reservations * progress);
      this.animatedStats.categories   = Math.round(targets.categories * progress);
      if (step >= steps) clearInterval(timer);
    }, interval);
  }

  toggleAudio(): void {
    const audio = this.audioRef?.nativeElement;
    if (!audio) return;
    if (this.isAudioPlaying) {
      audio.pause();
    } else {
      audio.volume = 0.2;
      audio.play();
    }
    this.isAudioPlaying = !this.isAudioPlaying;
  }

  getCategoryLabel(cat: string): string {
    const map: Record<string, string> = {
      tech: 'Tech', culture: 'Culture', sport: 'Sport',
      science: 'Science', music: 'Musique', autre: 'Autre'
    };
    return map[cat] || cat;
  }

  getCategoryClass(cat: string): string {
    const map: Record<string, string> = {
      tech: 'bg-primary', culture: 'bg-warning text-dark', sport: 'bg-success',
      science: 'bg-info text-dark', music: 'bg-purple', autre: 'bg-secondary'
    };
    return map[cat] || 'bg-secondary';
  }

  getImage(event: Event): string {
    if (event.image && /event-\d+\.(jpg|jpeg|png|webp)$/i.test(event.image))
      return `http://localhost:3000/uploads/${event.image}`;
    return `assets/images/event-${event.category}.jpg`;
  }

  ngOnDestroy(): void {
    this.audioRef?.nativeElement?.pause();
  }
}
