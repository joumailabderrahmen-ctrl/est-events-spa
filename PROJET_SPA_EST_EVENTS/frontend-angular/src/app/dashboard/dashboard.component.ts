import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { EventService } from '../shared/services/event.service';
import { ReservationService } from '../shared/services/reservation.service';
import { WebsocketService } from '../shared/services/websocket.service';
import { Reservation } from '../shared/models/reservation.model';
import { Subscription } from 'rxjs';

declare const Chart: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('pieChart') pieRef!:  ElementRef<HTMLCanvasElement>;
  @ViewChild('barChart') barRef!:  ElementRef<HTMLCanvasElement>;

  stats: any = {};
  reservations: Reservation[] = [];
  activeCount = 0;
  loading = true;

  private pieChart: any;
  private barChart: any;
  private sub!: Subscription;

  categoryLabels: Record<string, string> = {
    tech: 'Tech', culture: 'Culture', sport: 'Sport',
    science: 'Science', music: 'Musique', autre: 'Autre'
  };

  constructor(
    private eventService: EventService,
    private reservationService: ReservationService,
    private wsService: WebsocketService
  ) {}

  ngOnInit(): void {
    this.eventService.getStats().subscribe(data => {
      this.stats = data;
      this.loading = false;
      // Laisser Angular re-render le DOM (*ngIf levé) avant de construire les charts
      setTimeout(() => this.buildCharts(), 100);
    });

    this.reservationService.getAll().subscribe(res => {
      this.reservations = res.slice(0, 5);
    });

    this.wsService.connect();
    this.sub = this.wsService.getMessages().subscribe(msg => {
      if (msg.type === 'activeCount') this.activeCount = msg.count ?? 0;
    });
  }

  private buildCharts(): void {
    this.buildPieChart();
    this.buildBarChart();
  }

  private buildPieChart(): void {
    const canvas = this.pieRef?.nativeElement;
    if (!canvas || typeof Chart === 'undefined') return;
    if (this.pieChart) this.pieChart.destroy();
    this.pieChart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Gratuits', 'Payants'],
        datasets: [{
          data: [this.stats.freeEvents || 0, this.stats.paidEvents || 0],
          backgroundColor: ['#28a745', '#FFB300'],
          borderWidth: 0,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
          title: { display: true, text: 'Répartition Gratuits / Payants', font: { size: 14 } }
        },
        cutout: '65%'
      }
    });
  }

  private buildBarChart(): void {
    const canvas = this.barRef?.nativeElement;
    if (!canvas || typeof Chart === 'undefined') return;
    if (this.barChart) this.barChart.destroy();
    const cats   = (this.stats.byCategory || []).map((c: any) => this.categoryLabels[c._id] || c._id);
    const counts  = (this.stats.byCategory || []).map((c: any) => c.count);
    const colors  = ['#3498db','#e67e22','#2ecc71','#9b59b6','#e74c3c','#1abc9c'];
    this.barChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: cats,
        datasets: [{
          label: "Nombre d'événements",
          data: counts,
          backgroundColor: colors.slice(0, cats.length),
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: { display: true, text: 'Événements par catégorie', font: { size: 14 } }
        },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
      }
    });
  }

  getStatusClass(s: string): string { return s === 'confirmed' ? 'bg-success' : 'bg-warning text-dark'; }
  getStatusLabel(s: string): string { return s === 'confirmed' ? 'Confirmée' : 'En attente'; }

  ngOnDestroy(): void {
    this.pieChart?.destroy();
    this.barChart?.destroy();
    this.sub?.unsubscribe();
  }
}
