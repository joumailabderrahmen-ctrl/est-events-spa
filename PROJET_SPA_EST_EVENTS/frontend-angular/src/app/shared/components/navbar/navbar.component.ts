import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ReservationService } from '../../services/reservation.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit, OnDestroy {
  cartCount = 0;
  currentUser: User | null = null;
  private subs: Subscription[] = [];

  constructor(
    private reservationService: ReservationService,
    public auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subs.push(
      this.reservationService.getCart().subscribe(cart => this.cartCount = cart.length),
      this.auth.user$.subscribe(u => this.currentUser = u)
    );
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
}
