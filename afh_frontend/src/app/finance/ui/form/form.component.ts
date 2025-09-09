import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AutoComplete } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { Dialog } from 'primeng/dialog';
import { FileUpload } from 'primeng/fileupload';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { FinanceService } from '../../services/finance.service';
import { account, expense, income } from '../../../interfaces/models';
import { InputNumber } from 'primeng/inputnumber';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { LocalStorageService } from '../../../localstorage.service';

@Component({
  selector: 'app-form',
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
    ToastModule,
    FileUpload,
    DatePickerModule,
    AutoComplete,
    InputNumber,
    ConfirmDialog,
  ],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css',
  providers: [ConfirmationService, MessageService],
})
export default class FormComponent {
  @Input() visible: boolean = false;
  @Input() action: number = 0; // 0: Create, 1: Edit
  @Input() type: string = '';
  @Output() closeDialog = new EventEmitter<void>();
  @Output() onIncomeCreated = new EventEmitter<void>();
  @Output() onEgressCreated = new EventEmitter<void>();
  loading: boolean = false;
  actionTitle: string = '';
  selectedImage: File | null = null;
  selectedImagePreview: string | null = null;
  reason: string = '';
  people: string = '';
  amount: number = 0;
  date: Date | undefined;
  observations: string = '';
  target_accountTypeOptions: account[] = [];
  filteredTargetAccount: account[] = [];
  selectedTargetAccount: account | undefined;
  paymentMethodTypeOptions = ['EFECTIVO', 'TRANSFERENCIA', 'CHEQUE'];
  filteredPaymentMethod: string[] = [];
  selectedPaymentMethod: string = '';
  errorMessage: string = '';
  //para editar
  @Input() incomeToEdit: income | null = null;
  @Input() expenseToEdit: expense | null = null;

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private financeService: FinanceService,
    private localStorageService: LocalStorageService
  ) {
    this.initAccountsOptions();
  }

  onSubmit() {
    if (this.action === 0) {
      this.onCreate();
    }
    if (this.action === 1) {
      this.onEdit();
    }
  }

  onCreate() {
    if (this.errorMessage !== '') {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Todos los campos son requeridos',
      });
      return;
    }
    this.loading = true;
    const formData = new FormData();

    formData.append('responsible', this.people);
    formData.append('amount', this.amount.toString());
    formData.append(
      'date',
      this.date ? this.date.toISOString().split('T')[0] : ''
    );
    formData.append('reason', this.reason);
    formData.append('payment_method', this.selectedPaymentMethod);
    formData.append('observations', this.observations);
    console.log("id de la cuenta",this.selectedTargetAccount?.id);
    formData.append(
      this.type === 'ingreso' ? 'destination_account' : 'origin_account',
      this.selectedTargetAccount?.id.toString() || '0'
    );

    if (this.selectedImage) {
      formData.append('voucher', this.selectedImage);
    }
    if (this.type === 'ingreso') {
      this.financeService.createIncomes(formData).subscribe({
        next: () => {
          this.loading = false;
          this.closeDialog.emit();
          this.onIncomeCreated.emit();
          this.close();
        },
        error: (err) => {
          this.loading = false;
          console.log(err);
        },
      });
    }
    if (this.type === 'egreso') {
      this.financeService.createEgress(formData).subscribe({
        next: () => {
          this.loading = false;
          this.closeDialog.emit();
          this.onIncomeCreated.emit();
          this.close();
        },
        error: (err) => {
          this.loading = false;
          console.log(err);
        },
      });
    }
  }

  onEdit() {
    if (this.errorMessage !== '') {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Todos los campos son requeridos',
      });
      return;
    }
    this.loading = true;
    const formData = new FormData();
    if (this.people !== this.incomeToEdit?.responsible) {
      formData.append('responsible', this.people);
    }
    if (this.date?.toISOString().split('T')[0] !== this.incomeToEdit?.date) {
      formData.append(
        'date',
        this.date ? this.date.toISOString().split('T')[0] : ''
      );
    }
    if (this.reason !== this.incomeToEdit?.reason) {
      formData.append('reason', this.reason);
    }
    if (
      this.selectedTargetAccount?.id.toString() !==
      this.incomeToEdit?.destination_account
    ) {
      formData.append(
        this.type === 'ingreso' ? 'destination_account' : 'origin_account',
        this.selectedTargetAccount?.id.toString() || '0'
      );
    }
    if (this.selectedPaymentMethod !== this.incomeToEdit?.payment_method) {
      formData.append('payment_method', this.selectedPaymentMethod);
    }
    if (this.observations) {
      if (this.observations !== this.incomeToEdit?.observations) {
        formData.append('observations', this.observations);
      }
    } else {
      formData.append('observations', ' ');
    }
    if (this.selectedImage) {
      formData.append('voucher', this.selectedImage);
    }
    if (formData) {
      if (this.incomeToEdit?.id) {
        this.financeService
          .updateIncomes(formData, this.incomeToEdit.id)
          .subscribe({
            next: (response) => {
              this.close();
              this.onIncomeCreated.emit();
              this.loading = false;
            },
            error: (err) => {
              console.log(err);
              this.loading = false;
            },
          });
      }
      if (this.expenseToEdit?.id) {
        this.financeService
          .updateEgress(formData, this.expenseToEdit.id)
          .subscribe({
            next: (response) => {
              this.close();
              this.onEgressCreated.emit();
              this.loading = false;
            },
            error: (err) => {
              console.log(err);
              this.loading = false;
            },
          });
      }
    }
  }

  verify() {
    if (
      this.people === '' ||
      this.amount === 0 ||
      this.date === undefined ||
      this.reason === '' ||
      this.selectedTargetAccount === undefined ||
      this.selectedPaymentMethod === ''
    ) {
      this.errorMessage = 'Campo requerido';
    } else {
      this.errorMessage = '';
    }
  }

  initAccountsOptions() {
    console.log('buscando las cuentas');
    const accountsLS: account[] | null =
      this.localStorageService.getItem('accounts');
    if (accountsLS) {
      this.target_accountTypeOptions = accountsLS;
    }
  }

  filterTargetAccount(event: any) {
    const query = event.query.toLowerCase();
    this.filteredTargetAccount = this.target_accountTypeOptions
      .filter((option) => option.name.toLowerCase().includes(query));
  }

  filterPaymentMethod(event: any) {
    const query = event.query.toLowerCase();
    this.filteredPaymentMethod = this.paymentMethodTypeOptions.filter(
      (option) => option.toLowerCase().includes(query)
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['visible'] && this.visible === true) {
      if (this.action === 0) {
        this.actionTitle = 'Crear nuevo' + ' ' + this.type;
      } else if (this.action === 1) {
        this.actionTitle = 'Editar' + ' ' + this.type;
      }
    }
    if (this.incomeToEdit && this.type === 'ingreso') {
      this.people = this.incomeToEdit.responsible;
      this.amount = this.incomeToEdit.amount;
      this.reason = this.incomeToEdit.reason;
      this.observations = this.incomeToEdit.observations;
      this.date = new Date(this.incomeToEdit.date + 'T00:00:00');
      this.selectedPaymentMethod = this.incomeToEdit.payment_method;
      this.selectedTargetAccount = this.incomeToEdit.destination_account_info;
      this.observations = this.incomeToEdit.observations;
      this.selectedImagePreview = this.incomeToEdit.voucher;
    }
    if (this.expenseToEdit && this.type === 'egreso') {
      this.people = this.expenseToEdit.responsible;
      this.amount = this.expenseToEdit.amount;
      this.reason = this.expenseToEdit.reason;
      this.observations = this.expenseToEdit.observations;
      this.date = new Date(this.expenseToEdit.date + 'T00:00:00');
      this.selectedPaymentMethod = this.expenseToEdit.payment_method;
      this.selectedTargetAccount = this.expenseToEdit.origin_account_info;
      this.observations = this.expenseToEdit.observations;
      this.selectedImagePreview = this.expenseToEdit.voucher;
    }
  }

  resetForm() {
    this.actionTitle = '';
    this.loading = false;
    this.actionTitle = '';
    this.selectedImage = null;
    this.visible = false;
    this.date = undefined;
    this.people = '';
    this.observations = '';
    this.reason = '';
    this.amount = 0;
    this.selectedImage = null;
    this.selectedImagePreview = null;
    this.selectedPaymentMethod = '';
    this.selectedTargetAccount = undefined;
  }

  close() {
    this.resetForm();
    this.closeDialog.emit();
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

  onImageSelect(event: any) {
    const file = event.files[0]; // Solo tomamos la primera imagen
    if (file) {
      this.selectedImage = file;

      // Mostrar preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImagePreview = e.target.result; // Para mostrar <img [src]>
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.selectedImagePreview = null;
    this.selectedImage = null;
  }

  confirmEvent(event: Event) {
    this.verify();
    if (this.errorMessage !== '') {
      return;
    }
    if (this.action === 1) {
      this.onSubmit();
      return;
    }
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message:
        '¿Está seguro que desea continuar? el valor del monto no se puede cambiar',
      header: 'Confirmación',
      closable: true,
      closeOnEscape: true,
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Aceptar',
      },
      accept: () => {
        this.onSubmit();
        this.messageService.add({
          severity: 'info',
          summary: 'Exito',
          detail: 'Acción exitosa',
        });
      },
      reject: () => {},
    });
  }

  blockTyping(event: KeyboardEvent) {
    event.preventDefault();
  }
}
