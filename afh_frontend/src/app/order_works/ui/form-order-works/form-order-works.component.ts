import {
  Component,
  EventEmitter,
  Input,
  input,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  AutoCompleteCompleteEvent,
  OrderWork,
  Quote,
} from '../../../interfaces/models';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AutoComplete } from 'primeng/autocomplete';
import { TextareaModule } from 'primeng/textarea';
import { MultiSelectModule } from 'primeng/multiselect';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { FloatLabel } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { QuoteService } from '../../../quotes_works/services/quote.service';
import { Checkbox } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { OrderWorkService } from '../../services/work_order.service';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { InputNumber } from 'primeng/inputnumber';

@Component({
  selector: 'app-form-order-works',
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
    Checkbox,
    ToastModule,
    DatePickerModule,
    InputNumber,
  ],
  templateUrl: './form-order-works.component.html',
  styleUrl: './form-order-works.component.css',
})
export default class FormOrderWorksComponent {
  @Input() visible: boolean = false;
  @Input() action: number = 0;
  @Input() orderWorkToEdit: OrderWork | null = null;
  @Output() closeDialog = new EventEmitter<void>();
  @Output() onOrderWorkCreated = new EventEmitter<void>();
  actionTittle: string = '';
  technician: number = 0;
  supervisor: number = 0;
  officer: number = 0;
  auxiliary: number = 0;
  quotes: Quote[] = [];
  quotesWithoutOrder: Quote[] = [];
  selectedQuote: Quote | null = null;
  filteredQuotes: Quote[] | undefined;
  validQuote: boolean = false;
  quoteCode: string = '';
  workSiteOptions = ['Instalaciones del cliente', 'Instalaciones propias'];
  filteredWorkSites: string[] = [];
  selectedWorkSite: string = '';
  activityTypeOptions = ['Programado', 'Emergencia'];
  filteredActivities: string[] = [];
  selectedActivityType: string = '';
  descriptionActivity: string = '';
  permisosRequeridos: string[] = [];
  listaPermisos: string[] = [
    'Trabajo en alturas',
    'Trabajo en caliente',
    'Espacios confinados',
    'Energías peligrosas',
    'Izajes de cargas',
    'ATS (análisis de trabajo)',
  ];
  start_date: Date | undefined;
  loading: boolean = true;
  errorMessage: string = '';
  quoteInvalidMessage: string = '';
  scheduledExecutionTime: number = 0;

  constructor(
    private messageService: MessageService,
    private quoteService: QuoteService,
    private orderWorkService: OrderWorkService,
    private confirmationService: ConfirmationService
  ) {}

  filterWorkSite(event: any) {
    const query = event.query.toLowerCase();
    this.filteredWorkSites = this.workSiteOptions.filter((option) =>
      option.toLowerCase().includes(query)
    );
  }

  filterActivity(event: any) {
    const query = event.query.toLowerCase();
    this.filteredActivities = this.activityTypeOptions.filter((option) =>
      option.toLowerCase().includes(query)
    );
  }

  filterWorkReport(event: AutoCompleteCompleteEvent) {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.quotes.length; i++) {
      let quotesLet = this.quotes[i];
      if (quotesLet.code.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(quotesLet);
      }
    }

    this.filteredQuotes = filtered;
  }

  verify() {
    if (
      !this.selectedQuote ||
      !this.descriptionActivity ||
      !this.selectedWorkSite ||
      !this.selectedActivityType ||
      !this.start_date ||
      !this.permisosRequeridos ||
      this.scheduledExecutionTime === 0
    ) {
      this.errorMessage = 'Campo requerido';
      return;
    } else {
      this.errorMessage = '';
    }

    if (
      this.selectedQuote &&
      typeof this.selectedQuote === 'string' &&
      typeof (this.selectedQuote as string).trim === 'function'
    ) {
      const manualCode = (this.selectedQuote as string).trim();
      const match = this.filteredQuotes?.find((q) => q.code === manualCode);
      if (match) {
        this.selectedQuote = match;
      } else {
        this.quoteInvalidMessage =
          'Este cotización no ha sido aceptada o ya tiene una orden en curso';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Por favor seleccione una cotización válida del listado.',
        });
        return;
      }
    }
  }

  submit() {
    this.verify();
    if (this.errorMessage !== '') {
      this.loading = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor, complete todos los campos requeridos.',
      });
      return;
    }
    if (this.action === 0) {
      this.createOrderWork();
      return;
    }
    if (this.action === 1) {
      this.editWorkOrder();
      return;
    }
  }

  createOrderWork() {
    this.loading = true;

    if (this.start_date === undefined) {
      this.loading = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor, complete todos los campos requeridos.',
      });
      return;
    }

    let workSide = 0;
    if (this.selectedWorkSite) {
      if (this.selectedWorkSite === 'Instalaciones del cliente') {
        workSide = 1;
      }
      if (this.selectedWorkSite === 'Instalaciones propias') {
        workSide = 2;
      }
    } else {
      this.loading = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor, complete todos los campos requeridos.',
      });
      return;
    }
    let activityType = 0;
    if (this.selectedActivityType) {
      if (this.selectedActivityType === 'Emergencia') {
        activityType = 1;
      }
      if (this.selectedActivityType === 'Programado') {
        activityType = 2;
      }
    } else {
      this.loading = true;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor, complete todos los campos requeridos.',
      });
      return;
    }

    //validar si el campo es un texto y no se selecciona una opcion del autocomplete
    if (
      this.selectedQuote &&
      typeof this.selectedQuote === 'string' &&
      typeof (this.selectedQuote as string).trim === 'function'
    ) {
      const manualCode = (this.selectedQuote as string).trim();
      const match = this.filteredQuotes?.find((q) => q.code === manualCode);
      if (match) {
        this.selectedQuote = match;
      }
    }

    let data = {
      quote_id: this.selectedQuote?.id,
      start_date: this.start_date.toISOString().split('T')[0],
      description: this.descriptionActivity,
      workplace: workSide,
      number_technicians: this.technician,
      number_officers: this.officer,
      number_auxiliaries: this.auxiliary,
      number_supervisors: this.supervisor,
      activity: activityType,
      permissions: this.permisosRequeridos,
      days_of_execution: this.scheduledExecutionTime,
    };

    this.orderWorkService.createWorkOrder(data).subscribe({
      next: (response) => {
        this.loading = true;
        this.onOrderWorkCreated.emit();
        this.closeDialog.emit();
        this.close();
      },
      error: (err) => {
        console.log('error', err);
      },
    });
  }

  editWorkOrder() {
    this.loading = true;
    let quoteData: any = {};
    if (this.selectedQuote?.id !== this.orderWorkToEdit?.quote.id) {
      quoteData.quote_id = this.selectedQuote?.id;
    }
    if (this.descriptionActivity !== this.orderWorkToEdit?.description) {
      quoteData.description = this.descriptionActivity;
    }
    if (
      this.start_date?.toISOString().split('T')[0] !==
      this.orderWorkToEdit?.start_date
    ) {
      quoteData.start_date = this.start_date?.toISOString().split('T')[0];
    }
    let selectedWorkSiteNumber = 0;
    if (this.selectedWorkSite === 'Instalaciones del cliente') {
      selectedWorkSiteNumber = 2;
    } else if (this.selectedWorkSite === 'Instalaciones propias') {
      selectedWorkSiteNumber = 1;
    }
    if (selectedWorkSiteNumber !== this.orderWorkToEdit?.workplace) {
      quoteData.workplace = selectedWorkSiteNumber;
    }
    let currentActivity = this.selectedActivityType === 'Emergencia' ? 1 : 2;
    if (currentActivity !== this.orderWorkToEdit?.activity) {
      quoteData.activity = currentActivity;
    }
    const permisos: string[] = Array.isArray(this.orderWorkToEdit?.permissions)
      ? (this.orderWorkToEdit.permissions as string[])
      : typeof this.orderWorkToEdit?.permissions === 'string'
      ? (this.orderWorkToEdit.permissions as string)
          .split(',')
          .map((p: string) => p.trim())
      : [];

    if (
      JSON.stringify(this.permisosRequeridos.sort()) !==
      JSON.stringify(permisos.sort())
    ) {
      quoteData.permissions = this.permisosRequeridos;
    }
    if (this.technician !== this.orderWorkToEdit?.number_technicians) {
      quoteData.number_technicians = this.technician;
    }
    if (this.officer !== this.orderWorkToEdit?.number_officers) {
      quoteData.number_officers = this.officer;
    }
    if (this.auxiliary !== this.orderWorkToEdit?.number_auxiliaries) {
      quoteData.number_auxiliaries = this.auxiliary;
    }
    if (this.supervisor !== this.orderWorkToEdit?.number_supervisors) {
      quoteData.number_supervisors = this.supervisor;
    }
    if (this.scheduledExecutionTime !== this.orderWorkToEdit?.days_of_execution) {
      quoteData.days_of_execution = this.scheduledExecutionTime;
    }

    if (this.orderWorkToEdit?.id !== undefined) {
      this.orderWorkService
        .updateOrderWork(quoteData, this.orderWorkToEdit.id)
        .subscribe({
          next: (response) => {
            this.loading = true;
            this.onOrderWorkCreated.emit();
            this.closeDialog.emit();
            this.close();
          },
          error: (err) => {
            this.loading = false;
            console.log(err);
          },
        });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail:
          'No se pudo actualizar la orden de trabajo, intentelo nuevamente',
      });
    }
  }

  loadQuotes() {
    this.orderWorkService.getQuotesWithoutOrder().subscribe({
      next: (response) => {
        this.quotes = response;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las cotizaciones',
        });
      },
    });
  }

  resetForm() {
    this.validQuote = false;
    this.errorMessage = '';
    this.quoteInvalidMessage = '';
    this.selectedQuote = null;
    this.selectedWorkSite = '';
    this.selectedActivityType = '';
    this.permisosRequeridos = [];
    this.technician = 0;
    this.supervisor = 0;
    this.officer = 0;
    this.auxiliary = 0;
    this.descriptionActivity = '';
    this.start_date = undefined;
    this.action = 0;
    this.orderWorkToEdit = null;
    this.visible = false;
  }

  loadEditData() {
    let workplace = '';
    if (this.action === 1 && this.orderWorkToEdit) {
      const permisos = this.orderWorkToEdit.permissions;

      if (typeof permisos === 'string') {
        this.permisosRequeridos = (permisos as string)
          .split(',')
          .map((p: string) => p.trim());
      } else if (Array.isArray(permisos)) {
        this.permisosRequeridos = permisos;
      } else {
        this.permisosRequeridos = [];
      }
      if (this.orderWorkToEdit.workplace === 1) {
        workplace = 'Instalaciones propias';
      } else {
        workplace = 'Instalaciones cliente';
      }
      let activity = '';
      if (this.orderWorkToEdit.activity === 1) {
        activity = 'Emergencia';
      } else {
        activity = 'Programado';
      }
      this.descriptionActivity = this.orderWorkToEdit.description;
      this.selectedQuote = this.orderWorkToEdit.quote;
      this.officer = this.orderWorkToEdit.number_officers;
      this.supervisor = this.orderWorkToEdit.number_supervisors;
      this.auxiliary = this.orderWorkToEdit.number_auxiliaries;
      this.technician = this.orderWorkToEdit.number_technicians;
      this.selectedWorkSite = workplace;
      this.selectedActivityType = activity;
      this.start_date = new Date(this.orderWorkToEdit.start_date + 'T00:00:00');
    }
  }

  close() {
    this.resetForm();
    this.closeDialog.emit();
  }

  onQuoteChange() {
    if (this.selectedQuote && this.selectedQuote.id !== undefined) {
      this.validQuote = true;
      this.quoteCode = this.selectedQuote.code;
    } else {
      this.validQuote = false;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['visible'] && this.visible === true) {
      if (this.action === 0) {
        this.actionTittle = 'Generar orden de trabajo';
      } else if (this.action === 1) {
        this.actionTittle = 'Editar orden de trabajo';
        this.loadEditData();
      }

      this.loadQuotes();
    }
  }
  preventNonNumericInput(event: KeyboardEvent) {
    const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    if (!allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  }
  confirmationClose() {
    this.confirmationService.confirm({
      message:
        '¿Está seguro que desea cerrar el formulario? Los cambios se perderán',
      header: '¡Advertencia! Lea con atención.',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancelar',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Aceptar',
      },
      accept: () => {
        this.close();
      },
    });
  }

  blockTyping(event: KeyboardEvent) {
    event.preventDefault();
  }
}
