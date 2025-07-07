import { Component } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenuComponent } from '../../shared/ui/menu/menu.component';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { expense, income } from '../../interfaces/models';
import { NgIf } from '@angular/common';
import { SelectButton } from 'primeng/selectbutton';
import { DatePickerModule } from 'primeng/datepicker';
import FormComponent from '../form/form.component';
import { WorkReportService } from '../../work_report/services/work_report.service';

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
    SelectButton,
    DatePickerModule,
    FormComponent,
    ConfirmDialog,
  ],
  templateUrl: './management.component.html',
  styleUrl: './management.component.css',
  providers: [ConfirmationService, MessageService],
})
export default class ManagementComponent {
  loadingData: boolean = false;
  createVisible: boolean = false;
  action: number = 0;
  dateFilter: string = '';
  stateOptions: any[] = [
    { label: 'Ingresos', value: 'ingreso' },
    { label: 'Egresos', value: 'egreso' },
  ];
  value: string = '';
  data: income[] | expense[] = [];
  incomes: income[] = [
    {
      id: 1,
      amount: 1200,
      payment_method: 1,
      target_account: 'Cuenta Corriente 1111',
      date: '2025-07-06',
    },
    {
      id: 2,
      amount: 950,
      payment_method: 2,
      target_account: 'Nequi 2222',
      date: '2025-07-07',
    },
  ];

  expenses: expense[] = [
    {
      id: 1,
      amount: 300,
      payment_method: 1,
      target_account: 'Daviplata 3333',
      date: '2025-07-06',
    },
    {
      id: 2,
      amount: 450,
      payment_method: 2,
      target_account: 'Tarjeta Débito 4444',
      date: '2025-07-07',
    },
  ];

  constructor(
    private workReportService: WorkReportService,
    private messageService: MessageService
  ) {}

  openCreate() {
    this.createVisible = true;
  }

  closeCreate() {
    this.createVisible = false;
  }

  changeData() {
    console.log(this.value);
    if (this.value) {
      if (this.value === 'ingreso') {
        this.data = this.incomes;
      }
      if (this.value === 'egreso') {
        this.data = this.expenses;
      }
    } else {
      this.data = [];
    }
  }

  blockTyping(event: KeyboardEvent) {
    event.preventDefault();
  }
}
