import { Component, OnInit } from '@angular/core';
import { MenuComponent } from '../../../shared/ui/menu/menu.component';
import { AuthService } from '../../../shared/auth/data_access/auth.service';
import { HomeService } from '../../service/home.service';
import { CookieService } from 'ngx-cookie-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [MenuComponent, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  name: string = '';
  homeData: any = null;
  loading: boolean = true;

  constructor(
    private homeService: HomeService,
    private cookieService: CookieService
  ) {
    this.name = cookieService.get('name');
  }

  ngOnInit() {
    this.loadHomeData();
  }

  loadHomeData() {
    this.loading = true;
    this.homeService.getHomeData().subscribe({
      next: (data) => {
        this.homeData = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando datos del home:', error);
        this.loading = false;
      }
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  }

  getProgressColor(percentage: number): string {
    if (percentage < 30) return 'bg-red-500';
    if (percentage < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  }

  getStateText(state: number): string {
    switch(state) {
      case 1: return 'En Proceso';
      case 2: return 'Pendiente';
      case 3: return 'Completado';
      default: return 'Desconocido';
    }
  }

  getStateColor(state: number): string {
    switch(state) {
      case 1: return 'bg-blue-100 text-blue-800';
      case 2: return 'bg-yellow-100 text-yellow-800';
      case 3: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

}
