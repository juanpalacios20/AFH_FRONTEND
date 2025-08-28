import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import FormOrderWorksComponent from '../../ui/form-order-works/form-order-works.component';
import ViewOrdersWorkComponent from '../../ui/view-orders-work/view-orders-work.component';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MenuComponent } from '../../../shared/ui/menu/menu.component';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService } from 'primeng/api';
import { progressOrderService } from '../../services/progress_work.service';
import ProgressInfoComponent from '../progress-info/progress-info.component';
import { RouterModule } from '@angular/router';
import { workAdvanceService } from '../../services/work_advance.service';
import { WorkProgress } from '../../../interfaces/models';
import { LocalStorageService } from '../../../localstorage.service';
import { GlobalService } from '../../../global.service';

@Component({
  selector: 'app-management',
  imports: [
    ButtonModule,
    MenuComponent,
    InputIconModule,
    IconFieldModule,
    InputTextModule,
    FloatLabelModule,
    FormsModule,
    ToastModule,
    TableModule,
    TagModule,
    NgIf,
    RouterModule,
  ],
  templateUrl: './management.component.html',
  styleUrl: './management.component.css',
  providers: [ConfirmationService, MessageService],
})
export default class ProgressManagementComponent {
  workProgressOrder: WorkProgress[] = [];
  loadingworkProgressOrder: boolean = false;
  workProgressOrderFound: string = '';
  selectedWorkProgressOrder: WorkProgress | null = null;
  showView: boolean = false;

  constructor(
    private workProgressOrderService: progressOrderService,
    private workAdvanceService: workAdvanceService,
    private localStorageService: LocalStorageService,
    private globalService: GlobalService
  ) {
    this.getWorkProgressOrders();
    this.globalService.changeTitle('AFH: Progreso Ordenes');
  }

  viewProgressOrder(workProgressOrder: WorkProgress) {
    this.selectedWorkProgressOrder = workProgressOrder;
    this.localStorageService.setItem('progress', workProgressOrder);
    this.showView = true;
  }

  closeView() {
    this.showView = false;
    this.selectedWorkProgressOrder = null;
    this.getWorkProgressOrders();
  }

  getWorkProgressOrders() {
    const progressOrderLS: WorkProgress[] | null =
      this.localStorageService.getItem('progressOrders');
    if (progressOrderLS && progressOrderLS.length > 0) {
      this.workProgressOrder = progressOrderLS;
    } else {
      this.workProgressOrderService.getProgress().subscribe({
        next: (response) => {
          this.workProgressOrder = response;
          this.localStorageService.setItem(
            'progressOrders',
            this.workProgressOrder
          );
        },
        error: (err) => {
          console.error('Error fetching work progress orders:', err);
        },
      });
    }
  }

  getStateString(state: number): string {
    switch (state) {
      case 1:
        return 'Pendiente';
      case 2:
        return 'En Progreso';
      case 3:
        return 'Completado';
      default:
        return 'Desconocido';
    }
  }
}
