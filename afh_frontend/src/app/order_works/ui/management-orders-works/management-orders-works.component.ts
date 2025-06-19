import { Component, OnInit } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MenuComponent } from '../../../shared/ui/menu/menu.component';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService } from 'primeng/api';
import { OrderWorkService } from '../../services/work_order.service';
import ViewQuotesComponent from '../../../quotes_works/ui/view-quotes/view-quotes.component';
import { OrderWork } from '../../../interfaces/models';

@Component({
  selector: 'app-management-orders-works',
  imports: [
    ButtonModule,
    MenuComponent,
    InputIconModule,
    IconFieldModule,
    InputTextModule,
    FloatLabelModule,
    FormsModule,
    ConfirmDialog,
    ToastModule,
    TableModule,
    TagModule,
    ViewQuotesComponent,
  ],
  templateUrl: './management-orders-works.component.html',
  styleUrl: './management-orders-works.component.css',
  providers: [ConfirmationService, MessageService],
})
export default class ManagementOrdersWorksComponent implements OnInit {
  orderWorkFound: string | null = null;
  orderWorks: OrderWork[] = [];
  showDialog: boolean = false;
  orderWorkToView: OrderWork | null = null;
  state: string = '';
  severity: 'success' | 'info' | 'warn' | 'danger' | 'secondary' | undefined =
    undefined;

  constructor(private orderWorkService: OrderWorkService) {}

  showViewDialog(orderWork: OrderWork) {
    this.orderWorkToView = orderWork;
    this.state = this.getStateString(orderWork.Quotes.state);
    this.severity = this.getSeverity(orderWork.Quotes.state);
    this.showDialog = true;
  }

  closeViewDialog() {
    this.getOrders();
    this.showDialog = false;
  }

  handleQuoteCreated() {
    this.closeViewDialog();
  }

  getOrders() {
    this.orderWorkService.getOrders().subscribe({
      next: (response) => {
        this.orderWorks = response;
      },
      error: (error) => {
        console.error('Error fetching orders:', error);
      },
    });
  }

  ngOnInit() {
    this.getOrders();
  }

  getSeverity(
    state: number
  ): 'success' | 'warn' | 'danger' | 'secondary' | 'info' | undefined {
    switch (state) {
      case 1:
        return 'secondary';
      case 2:
        return 'success';
      case 3:
        return 'danger';
      default:
        return 'secondary'; // Map "unknown" to a valid type
    }
  }

  getStateString(state: number): string {
    switch (state) {
      case 1:
        return 'PROCESO';
      case 2:
        return 'APROBADO';
      case 3:
        return 'RECHAZADO';
      default:
        return 'Estado desconocido';
    }
  }
}
