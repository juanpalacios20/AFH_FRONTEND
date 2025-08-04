import { Component, OnInit } from '@angular/core';
import { DividerModule } from 'primeng/divider';
import { CardModule } from 'primeng/card';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { ButtonModule } from 'primeng/button';
import { Timeline } from 'primeng/timeline';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../../service/customer.service';
import { CookieService } from 'ngx-cookie-service';
import { Notification, WorkProgress } from '../../../interfaces/models';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '../../service/notification.service';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';

interface EventItem {
  status?: string;
  date?: string;
  icon?: string;
  color?: string;
  image?: string;
  description?: string;
  showButton?: boolean;
}

@Component({
  selector: 'app-home-work-customer',
  imports: [DividerModule, CardModule, ToolbarComponent, Timeline, ButtonModule, CommonModule, Toast],
  templateUrl: './home-work-customer.component.html',
  styleUrl: './home-work-customer.component.css', 
  providers: [MessageService]
})
export class HomeWorkCustomerComponent implements OnInit {

  name_customer: string = 'Cliente';
  events: EventItem[];
  work_progress: WorkProgress | null = null;
  
  


  constructor(
    private customerService: CustomerService,
    private cookiesService: CookieService,
    private router: Router,
    private notification: NotificationService,
    private messageService: MessageService
  ) {
    this.events = [
      { status: 'Pendiente', date: this.work_progress?.work_order.start_date, icon: 'pi pi-spinner-dotted', color: 'blue', description: 'El trabajo esta pendiente de inicio', showButton: true },
    ]
  }
  ngOnInit(): void {
    this.fecthWorkProgress();
  }

  showInfo() {
    this.messageService.add({ severity: 'info', summary: 'Tienes un nuevo avance del teabajo', detail: 'Revisa el nuevo avance'});
  }

  fecthWorkProgress() {
    this.customerService.getWorkProgress(this.cookiesService.get('id')).subscribe({
      next: (response) => {
        this.work_progress = response;
        switch (this.work_progress?.state) {
          case 2:
            console.log('imagen', this.work_progress.work_advance[0].exhibits[0].images[0])
            this.events = [...this.events, { status: 'En Progreso', date: this.work_progress.work_order.start_date, icon: 'pi pi-play', color: 'green', description: 'El trabajo ha comenzado, revisa los detalles', showButton: true, image: this.work_progress.work_advance[0].exhibits[0].images[0] }];
            break;
          case 3:
            this.events = [...this.events, { status: 'En Progreso', date: this.work_progress.work_order.start_date, icon: 'pi pi-play', color: 'green', description: 'El trabajo ha comenzado, revisa los detalles', showButton: true, image: this.work_progress.work_advance[0].exhibits[0].images[0] }];
            this.events = [...this.events, { status: 'Finalizado', date: this.work_progress.work_order.end_date, icon: 'pi pi-check-circle', color: 'green', description: 'El ha trabajo ha sidi finalizado con exito, prontamente recibira el acta de entrega con mas detalles de lo realizdo.', showButton: true, image: this.work_progress.work_advance[0].exhibits[0].images[0] }];
            break;
        }

        this.notification.setNotificationCount(this.work_progress?.id || 0)
      }, error: (error) => {
        console.error('Error fetching work progress:', error);
      }
    });
  }

  get workProgressStatus(): string {
    switch (this.work_progress?.state) {
      case 1:
        return 'Pendiente';
      case 2:
        return 'En Progreso';
      case 3:
        return 'Finalizado';
      case 4:
        return 'Cancelado';
      default:
        return 'Nombre del trabajo';
    }
  }

  advances() {
    this.router.navigate(['/work-advances']).then(() => {
    });
  }

  getMarkerClasses(event: any): string {
    return 'hover:shadow-lg transform transition-all duration-300';
  }

  getStatusBadge(event: any): string {
    // Lógica para determinar el badge según el estado
    return event.completed ? 'Completado' : 'En Progreso';
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('es-ES');
  }

  openImageModal(imageUrl: string): void {
    // Lógica para abrir modal de imagen
  }

  isLastEvent(event: any): boolean {
    return this.events.indexOf(event) === this.events.length - 1;
  }


}

