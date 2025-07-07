import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
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
    AutoComplete
  ],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css',
})
export default class FormComponent {
  @Input() visible: boolean = false;
  @Input() action: number = 0; // 0: Create, 1: Edit
  @Input() type: string = '';
  @Output() closeDialog = new EventEmitter<void>();
  @Output() onWorkReportCreated = new EventEmitter<void>();
  loading: boolean = false;
  actionTitle: string = '';
  selectedImage: File | null = null;
  reason: string = '';
  people: string = '';
  amount: number = 0;
  date: string = '';
  observations: string = '';
  target_accountTypeOptions = ['Caja principal', 'Cuenta bancolombia'];
  filteredTargetAccount: string[] = [];
  selectedTargetAccount: string = '';
  paymentMethodTypeOptions = ['Efectivo', 'Transferencia', 'Cheque'];
  filteredPaymentMethod: string[] = [];
  selectedPaymentMethod: string = '';

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  filterTargetAccount(event: any) {
    const query = event.query.toLowerCase();
    this.filteredTargetAccount = this.target_accountTypeOptions.filter((option) =>
      option.toLowerCase().includes(query)
    );
  }

  filterPaymentMethod(event: any) {
    const query = event.query.toLowerCase();
    this.filteredPaymentMethod = this.paymentMethodTypeOptions.filter((option) =>
      option.toLowerCase().includes(query)
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
  }

  resetForm() {
    this.loading = false;
    this.actionTitle = '';
    this.selectedImage = null;
    this.visible = false;
    this.date = '';
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

  blockTyping(event: KeyboardEvent) {
    event.preventDefault();
  }
}
