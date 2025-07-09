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
import { expense, income } from '../../../interfaces/models';
import { InputNumber } from 'primeng/inputnumber';

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
  ],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css',
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
  target_accountTypeOptions = ['CAJA PRINCIPAL', 'CUENTA BANCARIA'];
  filteredTargetAccount: string[] = [];
  selectedTargetAccount: string = '';
  paymentMethodTypeOptions = ['EFECTIVO', 'TRANSFERENCIA', 'CHEQUE'];
  filteredPaymentMethod: string[] = [];
  selectedPaymentMethod: string = '';
  errorMessage: string = '';
  //para editar
  @Input() incomeToEdit: income | null = null;
  @Input() expenseToEdit: expense | null = null;

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private financeService: FinanceService
  ) {}

  onSubmit() {
    this.verify();
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
        severity: 'danger',
        summary: 'Error',
        detail: 'Todos los campos son requeridos',
      });
      return;
    }
    this.loading = false;
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
    formData.append(
      this.type === 'ingreso' ? 'destination_account' : 'origin_account',
      this.account().toString()
    );

    if (this.selectedImage) {
      formData.append('voucher', this.selectedImage);
    }

    console.log('FormData:');
    for (const pair of formData.entries()) {
      console.log(`${pair[0]}:`, pair[1]);
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
        severity: 'danger',
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
    if (this.account() !== this.incomeToEdit?.destination_account) {
      formData.append(
        this.type === 'ingreso' ? 'destination_account' : 'origin_account',
        this.account().toString()
      );
    }
    if (this.selectedPaymentMethod !== this.incomeToEdit?.payment_method) {
      formData.append('payment_method', this.selectedPaymentMethod);
    }

    if (this.observations !== this.incomeToEdit?.observations) {
      formData.append('observations', this.observations);
    }

    if (this.selectedImage) {
      formData.append('voucher', this.selectedImage);
    }

    for (const pair of formData.entries()) {
      console.log(`${pair[0]}:`, pair[1]);
    }

    if (formData) {
      if (this.incomeToEdit?.id !== undefined) {
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
      if (this.expenseToEdit?.id !== undefined) {
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
      this.people === null ||
      this.amount === 0 ||
      this.date === null ||
      this.reason === '' ||
      this.selectedTargetAccount === '' ||
      this.selectedPaymentMethod === ''
    ) {
      this.errorMessage = 'Campo requerido';
    }
  }

  filterTargetAccount(event: any) {
    const query = event.query.toLowerCase();
    this.filteredTargetAccount = this.target_accountTypeOptions.filter(
      (option) => option.toLowerCase().includes(query)
    );
  }

  filterPaymentMethod(event: any) {
    const query = event.query.toLowerCase();
    this.filteredPaymentMethod = this.paymentMethodTypeOptions.filter(
      (option) => option.toLowerCase().includes(query)
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(this.action);
    if (changes['visible'] && this.visible === true) {
      if (this.action === 0) {
        this.actionTitle = 'Crear nuevo' + ' ' + this.type;
      } else if (this.action === 1) {
        this.actionTitle = 'Editar' + ' ' + this.type;
      }
    }
    if (this.incomeToEdit && this.type === 'ingreso') {
      console.log('income cambiao');
      this.people = this.incomeToEdit.responsible;
      this.amount = this.incomeToEdit.amount;
      this.reason = this.incomeToEdit.reason;
      this.observations = this.incomeToEdit.observations;
      this.date = new Date(this.incomeToEdit.date + 'T00:00:00');
      this.selectedPaymentMethod = this.incomeToEdit.payment_method;
      this.selectedTargetAccount =
        this.incomeToEdit.destination_account === 1
          ? 'CUENTA BANCARIA'
          : 'CAJA PRINCIPAL';
      this.observations = this.incomeToEdit.observations;
      this.selectedImagePreview = this.incomeToEdit.voucher;
    }
    if (this.expenseToEdit && this.type === 'egreso') {
      console.log('expense cambiao');
      this.people = this.expenseToEdit.responsible;
      this.amount = this.expenseToEdit.amount;
      this.reason = this.expenseToEdit.reason;
      this.observations = this.expenseToEdit.observations;
      this.date = new Date(this.expenseToEdit.date + 'T00:00:00');
      this.selectedPaymentMethod = this.expenseToEdit.payment_method;
      this.selectedTargetAccount =
        this.expenseToEdit.origin_account === 1
          ? 'CUENTA BANCARIA'
          : 'CAJA PRINCIPAL';
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
    this.selectedTargetAccount = '';
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

  account(): number {
    if (this.selectedTargetAccount === 'CUENTA BANCARIA') {
      return 1;
    }
    if (this.selectedTargetAccount === 'CAJA PRINCIPAL') {
      return 2;
    }
    return 0;
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

  blockTyping(event: KeyboardEvent) {
    event.preventDefault();
  }
}
