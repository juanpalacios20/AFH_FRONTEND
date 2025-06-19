import { CommonModule, NgIf } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AutoComplete, AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { OrderWorkService } from '../../../order_works/services/work_order.service';

interface Item {
  id: number;
  description: string;
  units: string;
  total_value: number;
  amount: number;
  unit_value: number;
}

interface Option {
  id: number;
  name: string;
  total_value: number;
  subtotal: string;
  total_value_formatted: string;
  items: Item[];
}

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface Quote {
  id: number;
  customer: Customer;
  code: string;
  description: string;
  issue_date: number;
  options: Option;
  state: number;
  tasks: string[];
  administration: number;
  unforeseen: number;
  utility: number;
  iva: number;
  method_of_payment: string;
  administration_value: string;
  unforeseen_value: string;
  utility_value: string;
  iva_value: string;
}

interface OrderWork {
  id: number;
  Quotes: Quote;
  start_date: string;
  end_date: string;
}

interface WorkReport {
  id: number;
  work_order: OrderWork;
  exhibits: exhibit[];
  date: string;
  observations: string;
  recommendations: string;
}

interface exhibit {
  id: number;
  tittle: string;
  image: string;
}

interface AutoCompleteCompleteEvent {
  originalEvent: Event;
  query: string;
}

@Component({
  selector: 'app-form-work',
  imports: [
    Dialog,
    ButtonModule,
    FloatLabel,
    FormsModule,
    InputTextModule,
    CommonModule,
    ToastModule,
    MultiSelectModule,
    TextareaModule,
    AutoComplete,
    ToastModule,
  ],
  templateUrl: './form-work.component.html',
  styleUrl: './form-work.component.css',
  providers: [MessageService, AutoCompleteModule],
})
export default class FormWorkComponent {
  @Input() visible: boolean = false;
  @Input() action: number = 0; // 0: Create, 1: Edit
  @Output() closeDialog = new EventEmitter<void>();
  @Output() onWorkReportCreated = new EventEmitter<void>();
  recommendations: string = '';
  observations: string = '';
  orderWork: OrderWork[] = [];
  selectedOrderWork: OrderWork | null = null;
  filteredOrderWork: any[] | undefined;
  orderWorks: OrderWork[] = [];
  tareas = [
    { titulo: 'Revisión técnica', subdescripciones: [''] },
    { titulo: 'Instalación de software', subdescripciones: [''] },
  ];

  constructor(
    private messageService: MessageService,
    private orderWorkService: OrderWorkService
  ) {}

  filterWorkReport(event: AutoCompleteCompleteEvent) {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.orderWorks.length; i++) {
      let orderWork = this.orderWorks[i];
      if (
        orderWork.Quotes.code.toLowerCase().indexOf(query.toLowerCase()) == 0
      ) {
        filtered.push(orderWork);
      }
    }

    this.filteredOrderWork = filtered;
  }

  loadOrderWorks() {
    this.orderWorkService.getOrders().subscribe({
      next: (response) => {
        this.orderWorks = response.filter((o: OrderWork) => !!o.end_date); // solo con fecha de cierre
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las órdenes de trabajo.',
        });
      },
    });
  }

  close() {
    this.visible = false;
    this.orderWorks = [];
    this.selectedOrderWork = null;
    this.filteredOrderWork = undefined;
    this.recommendations = '';
    this.observations = '';
    this.closeDialog.emit();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['visible']) {
      this.loadOrderWorks();
    }
  }
}
