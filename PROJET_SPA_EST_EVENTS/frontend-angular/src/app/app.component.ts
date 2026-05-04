import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';
import { LoadingService } from './shared/services/loading.service';
import { routeAnimations } from './shared/animations/route.animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  animations: [routeAnimations]
})
export class AppComponent implements OnInit {
  isLoading$!: Observable<boolean>;

  constructor(private loading: LoadingService) {}

  ngOnInit(): void {
    this.isLoading$ = this.loading.isLoading$;
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'] || outlet?.activatedRoute?.component;
  }
}
