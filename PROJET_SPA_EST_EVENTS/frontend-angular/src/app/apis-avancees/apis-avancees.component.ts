import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { WebsocketService } from '../shared/services/websocket.service';
import { ChatMessage } from '../shared/models/chat-message.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-apis-avancees',
  templateUrl: './apis-avancees.component.html',
  styleUrl: './apis-avancees.component.scss'
})
export class ApisAvanceesComponent implements OnInit, OnDestroy {
  @ViewChild('cameraVideo') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('cameraCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chatMessages') chatBoxRef!: ElementRef<HTMLDivElement>;

  /* ── GÉOLOCALISATION ── */
  coords: { lat: number; lng: number; accuracy: number } | null = null;
  geoError = '';
  geoLoading = false;
  mapUrl: SafeResourceUrl | null = null;
  readonly DAKHLA = { lat: 23.6848, lng: -15.9573 };

  /* ── WEBRTC ── */
  cameraActive = false;
  cameraStream: MediaStream | null = null;
  cameraError = '';
  capturedPhoto: string | null = null;

  /* ── WEBSOCKET CHAT ── */
  pseudo = '';
  messageText = '';
  messages: ChatMessage[] = [];
  wsConnected = false;
  activeCount = 0;
  private sub!: Subscription;

  constructor(
    private sanitizer: DomSanitizer,
    public wsService: WebsocketService
  ) {}

  ngOnInit(): void {
    this.wsService.connect();
    this.sub = this.wsService.getMessages().subscribe(msg => {
      if (msg.type === 'history' && msg.messages) {
        this.messages = msg.messages;
      } else if (msg.type === 'message') {
        this.messages.push(msg);
        setTimeout(() => this.scrollChat(), 50);
      } else if (msg.type === 'activeCount') {
        this.activeCount = msg.count ?? 0;
      }
      this.wsConnected = this.wsService.isConnected();
    });

    // Vérifier état connexion périodiquement
    const interval = setInterval(() => {
      this.wsConnected = this.wsService.isConnected();
    }, 1000);
    setTimeout(() => clearInterval(interval), 30000);

    this.setMap(this.DAKHLA.lat, this.DAKHLA.lng);
  }

  /* ════════════════════════════════
     GÉOLOCALISATION
  ════════════════════════════════ */
  localize(): void {
    if (!navigator.geolocation) {
      this.geoError = 'Géolocalisation non supportée par ce navigateur.';
      return;
    }
    this.geoLoading = true;
    this.geoError = '';
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.geoLoading = false;
        this.coords = {
          lat:      pos.coords.latitude,
          lng:      pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy)
        };
        this.setMap(this.coords.lat, this.coords.lng);
      },
      (err) => {
        this.geoLoading = false;
        const msgs: Record<number, string> = {
          1: 'Permission de localisation refusée.',
          2: 'Position indisponible.',
          3: 'Délai d\'attente dépassé.'
        };
        this.geoError = msgs[err.code] || 'Erreur de géolocalisation.';
        this.setMap(this.DAKHLA.lat, this.DAKHLA.lng);
      },
      { timeout: 8000, maximumAge: 60000 }
    );
  }

  private setMap(lat: number, lng: number): void {
    const url = `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.05},${lat-0.05},${lng+0.05},${lat+0.05}&layer=mapnik&marker=${lat},${lng}`;
    this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  useDakhlaFallback(): void {
    this.coords = { lat: this.DAKHLA.lat, lng: this.DAKHLA.lng, accuracy: 0 };
    this.geoError = '';
    this.setMap(this.DAKHLA.lat, this.DAKHLA.lng);
  }

  /* ════════════════════════════════
     WEBRTC
  ════════════════════════════════ */
  async toggleCamera(): Promise<void> {
    if (this.cameraActive) {
      this.stopCamera();
    } else {
      await this.startCamera();
    }
  }

  private async startCamera(): Promise<void> {
    this.cameraError = '';
    this.capturedPhoto = null;
    try {
      this.cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      this.cameraActive = true;
      setTimeout(() => {
        if (this.videoRef?.nativeElement) {
          this.videoRef.nativeElement.srcObject = this.cameraStream;
          this.videoRef.nativeElement.play();
        }
      }, 100);
    } catch {
      this.cameraError = 'Accès à la caméra refusé ou non disponible.';
    }
  }

  stopCamera(): void {
    this.cameraStream?.getTracks().forEach(t => t.stop());
    this.cameraStream = null;
    this.cameraActive = false;
  }

  capturePhoto(): void {
    const video  = this.videoRef?.nativeElement;
    const canvas = this.canvasRef?.nativeElement;
    if (!video || !canvas) return;
    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext('2d')!.drawImage(video, 0, 0);
    this.capturedPhoto = canvas.toDataURL('image/png');
  }

  downloadPhoto(): void {
    if (!this.capturedPhoto) return;
    const a = document.createElement('a');
    a.href = this.capturedPhoto;
    a.download = `photo-est-${Date.now()}.png`;
    a.click();
  }

  /* ════════════════════════════════
     WEBSOCKET CHAT
  ════════════════════════════════ */
  sendMessage(): void {
    const text = this.messageText.trim();
    const pseudo = this.pseudo.trim() || 'Anonyme';
    if (!text) return;
    this.wsService.send(pseudo, text);
    this.messageText = '';
  }

  onChatKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.sendMessage();
    }
  }

  private scrollChat(): void {
    const el = this.chatBoxRef?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }

  formatTime(iso: string): string {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.stopCamera();
  }
}
