import {
  Component,
  OnInit,
  PLATFORM_ID,
  ChangeDetectorRef,
  inject,
  effect,
  SimpleChanges,
} from '@angular/core';
import { MenuComponent } from '../../../shared/ui/menu/menu.component';
import { DatePicker } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser, NgFor, NgIf } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { AutoComplete } from 'primeng/autocomplete';
import { FinanceService } from '../../services/finance.service';
import { BalanceMonth, element } from '../../../interfaces/models';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-reports',
  imports: [
    MenuComponent,
    FormsModule,
    DatePicker,
    NgFor,
    NgIf,
    ChartModule,
    AutoComplete,
    ButtonModule,
  ],
  standalone: true,
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css',
})
export default class ReportsComponent implements OnInit {
  rangeDates: Date[] | undefined;
  elements: element[] = [
    {
      title: 'Ingresos',
      icon: 'pi pi-dollar',
      value: 0,
    },
    {
      title: 'Egresos',
      icon: 'pi pi-arrow-up-left',
      value: 0,
    },
    {
      title: 'Balance',
      icon: 'pi pi-chart-bar',
      value: 0,
    },
  ];
  data: any;
  options: any;
  platformId = inject(PLATFORM_ID);
  dataYear: any;
  optionsYear: any;
  platformIdYear = inject(PLATFORM_ID);
  day: Date | undefined;
  month: Date | undefined;
  year: Date | undefined;
  yearNumber: Number = 0;
  filterOptions = ['DIA', 'MES', 'AÑO', 'PERSONALIZADO'];
  filteredOptions: string[] = [];
  selectedFilter: string = '';
  balanceMonths: BalanceMonth[] = [];
  currentDate: Date = new Date();
  currentYear: number = this.currentDate.getFullYear();
  currentMonth: number = this.currentDate.getMonth() + 1;
  currentDay: number = this.currentDate.getDate();
  currentDateFormatted: string = `${this.currentYear}/${String(
    this.currentMonth
  ).padStart(2, '0')}/${String(this.currentDay).padStart(2, '0')}`;

  income: number = 0;
  expense: number = 0;
  balance: number = 0;
  nameMonth: String = '';
  charYearVisible: boolean = false;
  charMonthVisible: boolean = false;
  charCustomVisible: boolean = false;
  charDayVisible: boolean = false;
  loadingPDF: boolean = false;

  constructor(
    private cd: ChangeDetectorRef,
    private financeService: FinanceService
  ) {}

  //inicializador
  ngOnInit() {
    const { start, end } = this.getMonthStartEnd();
    this.financeService.getBalanceMonth(start, end).subscribe({
      next: (response) => {
        this.income = response.ingresos;
        this.expense = response.egresos;
        this.balance = response.balance;
        this.elements[0].value = this.income;
        this.elements[1].value = this.expense;
        this.elements[2].value = this.balance;
        console.log(this.income, this.expense, this.balance);
        this.initChart();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  //Los graficos
  initChart() {
    if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--p-text-color');

      this.data = {
        labels: ['Ingresos', 'Egresos', 'Balance'],
        datasets: [
          {
            data: [this.income, this.expense, this.balance],
            backgroundColor: [
              documentStyle.getPropertyValue('--p-graphics-50'),
              documentStyle.getPropertyValue('--p-graphics-150'),
              documentStyle.getPropertyValue('--p-primary-600'),
            ],
            hoverBackgroundColor: [
              documentStyle.getPropertyValue('--p-graphics-100'),
              documentStyle.getPropertyValue('--p-graphics-200'),
              documentStyle.getPropertyValue('--p-primary-400'),
            ],
          },
        ],
      };

      this.options = {
        cutout: '60%',
        plugins: {
          legend: {
            labels: {
              color: textColor,
            },
          },
        },
      };
      this.cd.markForCheck();
    }
  }

  initChartYear() {
    console.log('ingresos enero', this.balanceMonths);
    if (isPlatformBrowser(this.platformIdYear)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--p-text-color');
      const textColorSecondary = documentStyle.getPropertyValue(
        '--p-text-muted-color'
      );
      const surfaceBorder = documentStyle.getPropertyValue(
        '--p-content-border-color'
      );

      this.dataYear = {
        labels: [
          'Enero',
          'Febrero',
          'Marzo',
          'Abril',
          'Mayo',
          'Junio',
          'Julio',
          'Agosto',
          'Septiembre',
          'Octubre',
          'Noviembre',
          'Diciembre',
        ],
        datasets: [
          {
            label: 'Ingresos',
            backgroundColor: documentStyle.getPropertyValue('--p-green-500'),
            borderColor: documentStyle.getPropertyValue('--p-green-500'),
            data: [
              this.balanceMonths[0].ingresos,
              this.balanceMonths[1].ingresos,
              this.balanceMonths[2].ingresos,
              this.balanceMonths[3].ingresos,
              this.balanceMonths[4].ingresos,
              this.balanceMonths[5].ingresos,
              this.balanceMonths[6].ingresos,
              this.balanceMonths[7].ingresos,
              this.balanceMonths[8].ingresos,
              this.balanceMonths[9].ingresos,
              this.balanceMonths[10].ingresos,
              this.balanceMonths[11].ingresos,
            ],
          },
          {
            label: 'Egresos',
            backgroundColor: documentStyle.getPropertyValue('--p-red-500'),
            borderColor: documentStyle.getPropertyValue('--p-red-500'),
            data: [
              this.balanceMonths[0].egresos,
              this.balanceMonths[1].egresos,
              this.balanceMonths[2].egresos,
              this.balanceMonths[3].egresos,
              this.balanceMonths[4].egresos,
              this.balanceMonths[5].egresos,
              this.balanceMonths[6].egresos,
              this.balanceMonths[7].egresos,
              this.balanceMonths[8].egresos,
              this.balanceMonths[9].egresos,
              this.balanceMonths[10].egresos,
              this.balanceMonths[11].egresos,
            ],
          },
          {
            label: 'Balance',
            backgroundColor: documentStyle.getPropertyValue('--p-gray-500'),
            borderColor: documentStyle.getPropertyValue('--p-gray-500'),
            data: [
              this.balanceMonths[0].balance,
              this.balanceMonths[1].balance,
              this.balanceMonths[2].balance,
              this.balanceMonths[3].balance,
              this.balanceMonths[4].balance,
              this.balanceMonths[5].balance,
              this.balanceMonths[6].balance,
              this.balanceMonths[7].balance,
              this.balanceMonths[8].balance,
              this.balanceMonths[9].balance,
              this.balanceMonths[10].balance,
              this.balanceMonths[11].balance,
            ],
          },
        ],
      };

      this.optionsYear = {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        plugins: {
          legend: {
            labels: {
              color: textColor,
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: textColorSecondary,
              font: {
                weight: 500,
              },
              autoSkip: false, // 👈 IMPORTANTE: no saltar etiquetas
              maxRotation: 0, // 👈 Si no quieres que roten
              minRotation: 0,
            },
            grid: {
              color: surfaceBorder,
              drawBorder: false,
            },
          },

          y: {
            ticks: {
              color: textColorSecondary,
            },
            grid: {
              color: surfaceBorder,
              drawBorder: false,
            },
          },
        },
      };
      this.cd.markForCheck();
    }
  }

  //Customizado
  onCustomChange() {
    this.yearNumber = 0;
    this.charCustomVisible = true;
    this.charMonthVisible = false;
    this.charYearVisible = false;
    this.year = new Date();
    this.month = new Date();
    if (this.rangeDates) {
      this.getInfoCustom(
        this.rangeDates[0].toISOString().split('T')[0],
        this.rangeDates[1].toISOString().split('T')[0]
      );
    }
  }

  getInfoCustom(start: string, end: string) {
    this.financeService.getBalanceMonth(start, end).subscribe({
      next: (response) => {
        this.nameMonth = start + ' - ' + end;
        this.income = response.ingresos;
        this.expense = response.egresos;
        this.balance = response.balance;
        this.elements[0].value = this.income;
        this.elements[1].value = this.expense;
        this.elements[2].value = this.balance;
        console.log(this.income, this.expense, this.balance);
        this.initChart();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  //Por dia
  onDayChange() {
    this.yearNumber = 0;
    this.charCustomVisible = false;
    this.charMonthVisible = false;
    this.charYearVisible = false;
    this.year = new Date();
    this.month = new Date();
    this.getInfoDay();
  }

  getInfoDay() {
    this.charDayVisible = true;
    if (this.day) {
      this.financeService
        .getBalanceMonth(
          this.day.toISOString().split('T')[0],
          this.day.toISOString().split('T')[0]
        )
        .subscribe({
          next: (response) => {
            this.income = response.ingresos;
            this.expense = response.egresos;
            this.balance = response.balance;
            this.elements[0].value = this.income;
            this.elements[1].value = this.expense;
            this.elements[2].value = this.balance;
            this.initChart();
            if (this.day) {
              this.nameMonth = this.day.toISOString().split('T')[0];
            }
          },
          error(err) {
            console.log(err);
          },
        });
    }
  }

  downloadPdf() {
    this.loadingPDF = true;
    let { start, end } = this.getMonthStartEnd();
    if (this.day && this.charDayVisible) {
      start = this.day.toISOString().split('T')[0];
      end = this.day.toISOString().split('T')[0];
    }
    if (this.month && this.charMonthVisible) {
      const lastDay = new Date(
        this.month.getFullYear(),
        this.month.getMonth() + 1,
        0
      );
      start = this.month.toISOString().split('T')[0];
      end = lastDay.toISOString().split('T')[0];
    }
    if (this.year && this.charYearVisible) {
      const lastDay = new Date(
        this.year.getFullYear(),
        this.year.getMonth() + 12,
        0
      );
      start = this.year.toISOString().split('T')[0];
      end = lastDay.toISOString().split('T')[0];
    }
    if (this.year && this.charYearVisible) {
      const lastDay = new Date(
        this.year.getFullYear(),
        this.year.getMonth() + 12,
        0
      );
      start = this.year.toISOString().split('T')[0];
      end = lastDay.toISOString().split('T')[0];
    }

    if (this.rangeDates && this.charCustomVisible) {
      start = this.rangeDates[0].toISOString().split('T')[0];
      end = this.rangeDates[1].toISOString().split('T')[0];
    }

    this.financeService.pdfYear(start, end).subscribe({
      next: (response) => {
        // Crear el blob desde la respuesta solo si response.body no es null
        if (response.body) {
          const blob = new Blob([response.body], { type: 'application/pdf' });

          // Crear una URL para el blob
          const url = window.URL.createObjectURL(blob);

          // Crear un enlace temporal para descargar
          const link = document.createElement('a');
          link.href = url;
          link.download = `reporte-${start}-to-${end}.pdf`; // Nombre del archivo
          link.click();
          window.open(url, '_blank'); // Abre en nueva pestaña
          window.URL.revokeObjectURL(url);
          // Liberar la URL temporal
          window.URL.revokeObjectURL(url);
          this.loadingPDF = false;
        } else {
          console.error('La respuesta no contiene datos PDF.');
          this.loadingPDF = false;
        }
      },
      error: (err) => {
        console.error('Error al descargar PDF:', err);
        this.loadingPDF = false;
      },
    });
  }

  //Por mes
  onMonthChange(value: Date) {
    this.yearNumber = 0;
    this.year = new Date();
    this.rangeDates = [];
    this.charMonthVisible = true;
    this.charCustomVisible = false;
    this.charYearVisible = false;
    if (this.month) {
      this.getNameMonth(this.month.getMonth(), this.month.getFullYear());
    }
    this.getInfoMonth();
  }

  getMonthStartEnd(): { start: string; end: string } {
    this.charMonthVisible = true;
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    this.getNameMonth(now.getMonth(), now.getFullYear());
    const format = (date: Date) =>
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        '0'
      )}-${String(date.getDate()).padStart(2, '0')}`;

    return {
      start: format(firstDay),
      end: format(lastDay),
    };
  }

  getInfoMonth() {
    if (this.year && this.month) {
      if (this.year.getMonth() === this.month?.getMonth()) {
        this.income = this.balanceMonths[this.month?.getMonth() - 1].ingresos;
        this.expense = this.balanceMonths[this.month?.getMonth() - 1].egresos;
        this.balance = this.balanceMonths[this.month?.getMonth() - 1].balance;
        this.initChart();
      }
    }
    if (this.month) {
      const lastDay = new Date(
        this.month.getFullYear(),
        this.month.getMonth() + 1,
        0
      );
      const start = new Date(this.month);
      const end = new Date(lastDay);
      this.financeService
        .getBalanceMonth(
          start.toISOString().split('T')[0],
          end.toISOString().split('T')[0]
        )
        .subscribe({
          next: (response) => {
            this.income = response.ingresos;
            this.expense = response.egresos;
            this.balance = response.balance;
            this.elements[0].value = this.income;
            this.elements[1].value = this.expense;
            this.elements[2].value = this.balance;
            console.log(this.income, this.expense, this.balance);
            this.initChart();
          },
          error: (err) => {
            console.log(err);
          },
        });
    }
  }

  //Por año
  getInfo() {
    if (this.year) {
      this.yearNumber = this.year.getFullYear();
    }

    if (this.year) {
      const lastDay = new Date(
        this.year.getFullYear(),
        this.year.getMonth() + 12,
        0
      );
      const start = new Date(this.year);
      const end = new Date(lastDay);
      console.log('start', start.toISOString().split('T')[0]);
      console.log('end', end.toISOString().split('T')[0]);
      this.getBalanceMonths(
        start.toISOString().split('T')[0],
        end.toISOString().split('T')[0]
      );
    }
  }

  onYearChange(value: Date) {
    this.nameMonth = '';
    this.month = new Date();
    this.rangeDates = [];
    this.charYearVisible = true;
    this.charMonthVisible = false;
    this.charCustomVisible = false;
    this.getInfo();
  }

  getBalanceMonths(start: string, end: string) {
    this.financeService.getBalanceMonthDates(start, end).subscribe(
      (data) => {
        this.balanceMonths = data;
        console.log('Balance mensual completo:', this.balanceMonths);
        this.initChartYear();
        this.getFinanceYear();
      },
      (error) => {
        console.error('Error al obtener balance mensual:', error);
      }
    );
  }

  getFinanceYear() {
    if (this.balanceMonths) {
      for (let i = 0; i < this.balanceMonths.length; i++) {
        this.income = this.income + this.balanceMonths[i].ingresos;
        this.expense = this.expense + this.balanceMonths[i].egresos;
      }
      this.balance = this.income - this.expense;
      this.elements[0].value = this.income;
      this.elements[1].value = this.expense;
      this.elements[2].value = this.balance;
    }
    console.log(
      this.income,
      this.expense,
      this.balance,
      this.balanceMonths.length
    );
  }

  //Demas metodos para el correcto funcionamiento del componente
  getNameMonth(month: number, year: number) {
    const monthNames = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    this.nameMonth = monthNames[month] + ' ' + year.toString();
  }

  filterOption(event: any) {
    const query = event.query.toLowerCase();
    this.filteredOptions = this.filterOptions.filter((option) =>
      option.toLowerCase().includes(query)
    );
  }

  blockTyping(event: KeyboardEvent) {
    event.preventDefault();
  }
}
