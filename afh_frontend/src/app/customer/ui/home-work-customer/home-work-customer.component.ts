import { Component, OnInit } from '@angular/core';
import { DividerModule } from 'primeng/divider';
import { CardModule } from 'primeng/card';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { ButtonModule } from 'primeng/button';
import { Timeline } from 'primeng/timeline';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../../service/customer.service';
import { CookieService } from 'ngx-cookie-service';
import { WorkProgress } from '../../../interfaces/models';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

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
  imports: [DividerModule, CardModule, ToolbarComponent, Timeline, ButtonModule, CommonModule],
  templateUrl: './home-work-customer.component.html',
  styleUrl: './home-work-customer.component.css'
})
export class HomeWorkCustomerComponent implements OnInit {

  name_customer: string = 'Cliente';
   events: EventItem[];
   work_progress: WorkProgress | null = null;


    constructor(
        private customerService: CustomerService,
        private cookiesService: CookieService,
    ) {
      this.events = [
        { status: 'Pendiente', date: this.work_progress?.work_order.start_date, icon: 'pi pi-spinner-dotted', color: 'blue', description: 'El trabajo esta pendiente de inicio', showButton: false },
      ]
    }
    ngOnInit(): void {
      this.fecthWorkProgress();
  }

    fecthWorkProgress(){
      this.customerService.getWorkProgress(this.cookiesService.get('id')).subscribe({
        next: (response) => {
          this.work_progress = response;
          console.log('Work progress fetched:', this.work_progress);
          switch(this.work_progress?.state) {
            case 2:
                this.events = [...this.events, { status: 'Iniciado', date: this.work_progress.work_order.start_date, icon: 'pi pi-play', color: 'green', description: 'El trabajo ha comenzado, revisa los detalles', showButton: true }];
                break;
          }
          console.log(this.events);
    }, error: (error) => {
          console.error('Error fetching work progress:', error);
        }
      });
    }

     get workProgressStatus(): string {
        switch(this.work_progress?.state) {
            case 1:
                return 'Pendiente';
            case 2:
                return 'Iniciado';
            case 3:
                return 'Finalizado';
            case 4:
                return 'Cancelado';
            default:
                return 'Nombre del trabajo';
        }
    }
  
    


}

