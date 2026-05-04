import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { StorageService } from '../shared/services/storage.service';
import { ReservationService } from '../shared/services/reservation.service';
import { StudentProfile } from '../shared/models/student-profile.model';
import { Reservation } from '../shared/models/reservation.model';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrl: './profil.component.scss'
})
export class ProfilComponent implements OnInit, OnDestroy {
  @ViewChild('videoEl') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasEl') canvasRef!: ElementRef<HTMLCanvasElement>;

  form: FormGroup;
  savedIndicator = false;
  photoSrc = 'assets/images/avatar-default.png';

  cameraActive = false;
  stream: MediaStream | null = null;
  cameraError = '';

  reservations: Reservation[] = [];
  loadingReservations = false;
  cancellingId: string | null = null;

  filieres = ['CDL', 'GI', 'GC', 'GE', 'GM', 'TC', 'Autre'];
  annees   = ['1ère année', '2ème année', '3ème année'];

  private apiUrl = environment.apiUrl;

  constructor(
    private fb: FormBuilder,
    private storage: StorageService,
    private reservationService: ReservationService,
    private http: HttpClient
  ) {
    this.form = this.fb.group({
      nom:           ['', [Validators.required, Validators.minLength(2)]],
      prenom:        ['', [Validators.required, Validators.minLength(2)]],
      email:         ['', [Validators.required, Validators.email]],
      etablissement: ['EST Dakhla'],
      filiere:       ['CDL'],
      annee:         ['1ère année']
    });
  }

  ngOnInit(): void {
    const saved = this.storage.get<StudentProfile>('profil');
    if (saved) {
      this.form.patchValue(saved);
      if (saved.photo) this.photoSrc = saved.photo;
      this.loadReservations(saved.email);
    }
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const profil: StudentProfile = { ...this.form.value, photo: this.photoSrc };
    this.storage.set('profil', profil);
    this.savedIndicator = true;
    setTimeout(() => this.savedIndicator = false, 3000);
    this.loadReservations(profil.email);
  }

  /* ── WEBCAM ── */
  async startCamera(): Promise<void> {
    this.cameraError = '';
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      this.cameraActive = true;
      setTimeout(() => {
        if (this.videoRef?.nativeElement) {
          this.videoRef.nativeElement.srcObject = this.stream;
          this.videoRef.nativeElement.play();
        }
      }, 100);
    } catch {
      this.cameraError = 'Accès à la caméra refusé ou non disponible.';
    }
  }

  capture(): void {
    const video  = this.videoRef?.nativeElement;
    const canvas = this.canvasRef?.nativeElement;
    if (!video || !canvas) return;
    canvas.width  = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d')!;
    ctx.save();
    ctx.beginPath();
    ctx.arc(100, 100, 100, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(video, 0, 0, 200, 200);
    ctx.restore();
    this.photoSrc = canvas.toDataURL('image/png');
    this.storage.set('profil_photo', this.photoSrc);
    this.stopCamera();
  }

  stopCamera(): void {
    this.stream?.getTracks().forEach(t => t.stop());
    this.stream = null;
    this.cameraActive = false;
  }

  resetPhoto(): void {
    this.photoSrc = 'assets/images/avatar-default.png';
    this.storage.remove('profil_photo');
  }

  /* ── HISTORIQUE ── */
  loadReservations(email: string): void {
    if (!email) return;
    this.loadingReservations = true;
    this.reservationService.getAll(email).subscribe({
      next: (res) => { this.reservations = res; this.loadingReservations = false; },
      error: () => { this.loadingReservations = false; }
    });
  }

  cancelReservation(id: string | undefined): void {
    if (!id || !confirm('Annuler cette réservation ?')) return;
    this.cancellingId = id;
    this.http.patch(`${this.apiUrl}/reservations/${id}/cancel`, {}).subscribe({
      next: () => {
        const r = this.reservations.find(x => x._id === id);
        if (r) (r as any).status = 'cancelled';
        this.cancellingId = null;
      },
      error: () => this.cancellingId = null
    });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = { confirmed: 'bg-success', cancelled: 'bg-danger', pending: 'bg-warning text-dark' };
    return map[status] || 'bg-warning text-dark';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = { confirmed: 'Confirmée', cancelled: 'Annulée', pending: 'En attente' };
    return map[status] || 'En attente';
  }

  fieldInvalid(f: string): boolean {
    const ctrl = this.form.get(f);
    return !!(ctrl?.invalid && ctrl.touched);
  }

  ngOnDestroy(): void {
    this.stopCamera();
  }
}
