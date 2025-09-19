import { Component, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenuComponent } from '../../../shared/ui/menu/menu.component';
import { TagModule } from 'primeng/tag';
import { Table, TableModule } from 'primeng/table';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { account, expense, income } from '../../../interfaces/models';
import { NgFor, NgIf } from '@angular/common';
import { SelectButton } from 'primeng/selectbutton';
import { DatePickerModule } from 'primeng/datepicker';
import FormComponent from '../form/form.component';
import { WorkReportService } from '../../../work_report/services/work_report.service';
import { FinanceService } from '../../services/finance.service';
import ViewsComponent from '../views/views.component';
import { GlobalService } from '../../../global.service';
import { LocalStorageService } from '../../../localstorage.service';
import FormAccountComponent from '../form-account/form-account.component';

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
    ViewsComponent,
    FormAccountComponent,
  ],
  templateUrl: './management.component.html',
  styleUrl: './management.component.css',
  providers: [ConfirmationService, MessageService],
})
export default class ManagementComponent implements OnInit {
  @ViewChild('tf') table!: Table;
  loadingData: boolean = false;
  //crear
  createVisible: boolean = false;
  createAccountVisible: boolean = false;
  action: number = 0;
  dateFilter: string = '';
  stateOptions: any[] = [
    { label: 'Ingresos', value: 'ingreso' },
    { label: 'Egresos', value: 'egreso' },
    { label: 'Cuentas', value: 'cuenta' },
  ];
  value: string = '';
  data: income[] | expense[] = [];
  type: number = 0; //0 income, 1 exprense, 2 account
  incomes: income[] = [];
  expenses: expense[] = [];
  accounts: account[] = [];
  //editar
  editIncomeVisible: boolean = false;
  editAccountVisible: boolean = false;
  editExpenseVisible: boolean = false;
  incomeToEdit: income | null = null;
  expenseToEdit: expense | null = null;
  accountToEdit: account | undefined;
  //visualizar
  visibleViewIncome: boolean = false;
  visibleViewExpense: boolean = false;
  visibleViewAccount: boolean = false;
  incomeToView: income | null = null;
  expenseToView: expense | null = null;
  accountToView: account | null = null;
  tittleAction: string | undefined;
  infoData: any[] = [];
  displayedColumns: { field: string; header: string }[] = [];

  constructor(
    private workReportService: WorkReportService,
    private messageService: MessageService,
    private financeService: FinanceService,
    private localStorageService: LocalStorageService,
    private globalService: GlobalService
  ) {
    this.globalService.changeTitle('AFH: Finanzas');
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const incomesLS: income[] | null =
      this.localStorageService.getItem('incomes');
    const expenseLS: expense[] | null =
      this.localStorageService.getItem('expenses');
    const accountLS: account[] | null =
      this.localStorageService.getItem('accounts');
    if (incomesLS && incomesLS.length > 0) {
      this.incomes = incomesLS;
    } else {
      this.financeService.getIncomes().subscribe({
        next: (response) => {
          this.incomes = response;
          this.localStorageService.setItem('incomes', this.incomes);
        },
        error: (err) => {
        },
      });
    }
    if (expenseLS && expenseLS.length > 0) {
      this.expenses = expenseLS;
    } else {
      this.financeService.getEgress().subscribe({
        next: (response) => {
          this.expenses = response;
          this.localStorageService.setItem('expenses', this.expenses);
        },
        error: (err) => {
        },
      });
    }
    if (accountLS && accountLS.length > 0) {
      this.accounts = accountLS;
    } else {
      this.financeService.getAccounts().subscribe({
        next: (response) => {
          this.accounts = response;
          this.localStorageService.setItem('accounts', this.accounts);
        },
        error: (err) => {
        },
      });
    }
  }

  openEditIncome(income: income) {
    this.editIncomeVisible = true;
    this.incomeToEdit = income;
    this.action = 1;
  }

  openEditExpense(expense: expense) {
    this.editExpenseVisible = true;
    this.expenseToEdit = expense;
    this.action = 1;
  }

  openEditAccount(account: account) {
    this.editAccountVisible = true;
    this.accountToEdit = account;
  }

  closeEdit() {
    this.localStorageService.removeItem('incomes');
    this.localStorageService.removeItem('expenses');
    this.editExpenseVisible = false;
    this.editIncomeVisible = false;
    this.createAccountVisible = false;
    this.action = 0;
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Cambios guardados con éxito',
    });
    this.loadData();
  }

  openCreate() {
    if (this.type === 0 || this.type === 1) {
      this.createVisible = true;
      this.action = 0;
    }
    if (this.type === 2) {
      this.createAccountVisible = true;
    }
  }

  closeCreate() {
    this.localStorageService.removeItem('incomes');
    this.localStorageService.removeItem('expenses');
    this.localStorageService.removeItem('accounts');
    this.createVisible = false;
    this.action = 0;
    this.loadData();
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Creado con éxito',
    });
  }

  openViewIncome(income: income) {
    this.incomeToView = income;
    this.visibleViewIncome = true;
  }

  openViewExpense(expense: expense) {
    this.expenseToView = expense;
    this.visibleViewExpense = true;
  }

  openViewAccount(account: account) {
    this.accountToView = account;
    this.visibleViewAccount = true;
  }

  closeView() {
    this.incomeToView = null;
    this.expenseToView = null;
    this.accountToView = null;
    this.visibleViewIncome = false;
    this.visibleViewExpense = false;
    this.visibleViewAccount = false;
  }

  closeActionAccount() {
    this.localStorageService.removeItem('accounts');
    this.createAccountVisible = false;
    this.editAccountVisible = false;
    this.loadData();
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Acción realizada con exito',
    });
  }

  closeEditAccount() {
    this.localStorageService.removeItem('accounts');
    this.editAccountVisible = false;
    this.loadData();
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Creado con éxito',
    });
  }

  changeData() {
    this.dateFilter = '';
    if (this.value) {
      if (this.value === 'ingreso') {
        this.tittleAction = 'Crear ingreso';
        this.type = 0;
        this.infoData = this.incomes;
      }
      if (this.value === 'egreso') {
        this.tittleAction = 'Crear egreso';
        this.type = 1;
        this.infoData = this.expenses;
      }
      if (this.value === 'cuenta') {
        this.tittleAction = 'Ingresar cuenta';
        this.type = 2;
      }
    } else {
      this.data = [];
    }
  }

  blockTyping(event: KeyboardEvent) {
    event.preventDefault();
  }

  filterByDate() {
    if (!this.dateFilter) {
      this.table.clear(); // Limpia filtros si la fecha se borra
    } else {
      const formattedDate = this.formatDate(this.dateFilter);
      this.table.filterGlobal(formattedDate, 'contains');
    }
  }

  formatDate(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`; // mismo formato que tu tabla
  }
}
