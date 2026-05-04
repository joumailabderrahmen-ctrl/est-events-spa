import { Component } from '@angular/core';

@Component({
  selector: 'app-apropos',
  templateUrl: './apropos.component.html',
  styleUrl: './apropos.component.scss'
})
export class AproposComponent {
  currentYear   = new Date().getFullYear();
  academicYear  = '2025–2026';
  githubUrl     = 'https://github.com/joumailabderrahmen-ctrl/est-events-spa';

  stack = [
    { icon: 'bi-diagram-3-fill',    label: 'Angular 17',           color: '#dd0031' },
    { icon: 'bi-server',             label: 'Node.js / Express 5',  color: '#6cc24a' },
    { icon: 'bi-database-fill',      label: 'MongoDB / Mongoose',   color: '#4DB33D' },
    { icon: 'bi-shield-lock-fill',   label: 'JWT / bcrypt',         color: '#FFB300' },
    { icon: 'bi-broadcast',          label: 'WebSocket',            color: '#1e90ff' },
    { icon: 'bi-geo-alt-fill',       label: 'Geolocation + Leaflet',color: '#2ecc71' },
    { icon: 'bi-camera-video-fill',  label: 'WebRTC',               color: '#e74c3c' },
    { icon: 'bi-bar-chart-fill',     label: 'Chart.js',             color: '#FF6384' },
    { icon: 'bi-bootstrap-fill',     label: 'Bootstrap 5',          color: '#7952b3' },
    { icon: 'bi-palette-fill',       label: 'Canvas API',           color: '#f39c12' }
  ];

  features = [
    { icon: 'bi-calendar-event-fill',  title: 'Gestion d\'événements',   desc: 'CRUD complet avec upload d\'image, catégories et capacités' },
    { icon: 'bi-cart-fill',            title: 'Réservation Drag & Drop', desc: 'Panier interactif HTML5 natif, formulaire réactif Angular' },
    { icon: 'bi-chat-dots-fill',       title: 'Chat temps réel',         desc: 'WebSocket bidirectionnel avec historique et compteur en ligne' },
    { icon: 'bi-graph-up',             title: 'Dashboard analytique',    desc: 'Graphiques Chart.js, statistiques et KPI en temps réel' },
    { icon: 'bi-person-badge-fill',    title: 'Authentification JWT',    desc: 'Rôles admin/étudiant, guards Angular, intercepteurs HTTP' },
    { icon: 'bi-phone-landscape-fill', title: 'APIs HTML5 avancées',     desc: 'Géolocalisation, WebRTC webcam, Canvas, localStorage' }
  ];
}
