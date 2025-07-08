import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenuComponent } from '../../../shared/ui/menu/menu.component';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { expense, income } from '../../../interfaces/models';
import { NgIf } from '@angular/common';
import { SelectButton } from 'primeng/selectbutton';
import { DatePickerModule } from 'primeng/datepicker';
import FormComponent from '../form/form.component';
import { WorkReportService } from '../../../work_report/services/work_report.service';
import { FinanceService } from '../../services/finance.service';

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
export default class ManagementComponent implements OnInit {
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
  type: number = 0; //0 income, 1 exprense
  incomes: income[] = [];
  expenses: expense[] = [];

  constructor(
    private workReportService: WorkReportService,
    private messageService: MessageService,
    private financeService: FinanceService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    console.log('Trayendo informacion');
    this.financeService.getIncomes().subscribe({
      next: (response) => {
        this.incomes = response;
        console.log(response);
      },
      error: (err) => {
        console.log(err);
      },
    });
    this.financeService.getEgress().subscribe({
      next: (response) => {
        this.expenses = response;
        console.log(response);
      },
      error: (err) => {
        console.log(err.error);
      },
    });
  }

  openCreate() {
    this.createVisible = true;
  }

  closeCreate() {
    this.createVisible = false;
  }

  account(number: number): string {
    if (number === 1) {
      return 'CUENTA BANCARIA';
    }
    if (number === 2) {
      return 'CAJA PRINCIPAL';
    }
    return '';
  }

  changeData() {
    console.log(this.value);
    if (this.value) {
      if (this.value === 'ingreso') {
        this.type = 0;
      }
      if (this.value === 'egreso') {
        this.type = 1;
      }
    } else {
      this.data = [];
    }
  }

  blockTyping(event: KeyboardEvent) {
    event.preventDefault();
  }
}
