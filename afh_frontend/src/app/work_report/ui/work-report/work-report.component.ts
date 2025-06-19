import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MenuComponent } from '../../../shared/ui/menu/menu.component';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService } from 'primeng/api';
import FormWorkComponent from '../form-work/form-work.component';
import { WorkReportService } from '../../services/work_report.service';

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

@Component({
  selector: 'app-work-report',
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
    FormWorkComponent,
  ],
  templateUrl: './work-report.component.html',
  styleUrl: './work-report.component.css',
  providers: [ConfirmationService, MessageService],
})
export default class WorkReportComponent implements OnInit {
  workReports: WorkReport[] = [];
  workReportDialogVisible: boolean = false;

  constructor(
    private workReportService: WorkReportService,
    private messageService: MessageService
  ) {}

  showCreateWorkReportDialog() {
    this.workReportDialogVisible = true;
  }

  closeWorkReportDialog() {
    this.workReportDialogVisible = false;
  }

  handleWorkReportCreated() {
    this.closeWorkReportDialog();
  }

  ngOnInit() {
    this.loadWorkReports();
  }

  loadWorkReports() {
    this.workReportService.getWorkReports().subscribe({
      next: (response) => {
        this.workReports = response;
        console.log('Work reports loaded:', this.workReports);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load work reports',
        });
      },
    });
  }
}
