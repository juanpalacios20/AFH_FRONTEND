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
import FormOrderWorksComponent from '../form-order-works/form-order-works.component';
import ViewOrdersWorkComponent from '../view-orders-work/view-orders-work.component';

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
    ViewOrdersWorkComponent,
    FormOrderWorksComponent,
  ],
  templateUrl: './management-orders-works.component.html',
  styleUrl: './management-orders-works.component.css',
  providers: [ConfirmationService, MessageService],
})
export default class ManagementOrdersWorksComponent implements OnInit {
  orderWorkFound: string | null = null;
  orderWorks: OrderWork[] = [];
  showDialog: boolean = false;
  showEditDialog: boolean = false;
  action: number = 0;
  orderWorkToView: OrderWork | null = null;
  orderWorkToEdit: OrderWork | null = null;
  OrderWorkDialogVisible: boolean = false;
  state: string = '';
  severity: 'success' | 'info' | 'warn' | 'danger' | 'secondary' | undefined =
    undefined;

  constructor(
    private orderWorkService: OrderWorkService,
    private messageService: MessageService
  ) {}

  showViewDialog(orderWork: OrderWork) {
    this.orderWorkToView = orderWork;
    this.state = this.getStateString(orderWork.quote.state);
    this.severity = this.getSeverity(orderWork.quote.state);
    this.showDialog = true;
  }

  showCreateOrderWorkDialog() {
    this.action = 0;
    this.OrderWorkDialogVisible = true;
  }

  showEditOrderWorkDialog(orderWork: OrderWork) {
    this.action = 1;
    this.orderWorkToEdit = orderWork;
    this.showEditDialog = true;
  }

  closeViewDialog() {
    this.getOrders();
    this.orderWorkToView = null;
    this.showDialog = false;
  }

  closeCreateDialog() {
    this.OrderWorkDialogVisible = false;
    this.getOrders();
  }

  closeEditDialog() {
    this.showEditDialog = false;
    this.action = 0;
    this.getOrders();
  }

  handleOrderWorkCreated() {
    this.closeCreateDialog();
    this.messageService.add({
      severity: 'success',
      summary: 'Exito',
      detail: 'Orden de trabajo creada correctamente',
    });
    this.getOrders();
  }

  handleOrderWorkEdited() {
    this.closeEditDialog();
    this.messageService.add({
      severity: 'success',
      summary: 'Exito',
      detail: 'Orden de trabajo editada correctamente',
    });
  }


  getOrders() {
    this.orderWorkService.getOrders().subscribe({
      next: (response) => {
        console.log(response);
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
