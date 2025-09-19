import { CommonModule, NgIf } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AutoComplete } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { Dialog } from 'primeng/dialog';
import { FileUpload } from 'primeng/fileupload';
import { FloatLabel } from 'primeng/floatlabel';
import { InputNumber } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { FinanceService } from '../../services/finance.service';
import { account } from '../../../interfaces/models';
import { TitleStrategy } from '@angular/router';

@Component({
  selector: 'app-form-account',
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
    DatePickerModule,
    AutoComplete,
    InputNumber,
    ConfirmDialog,
    NgIf,
  ],
  templateUrl: './form-account.component.html',
  styleUrl: './form-account.component.css',
  providers: [ConfirmationService, MessageService],
})
export default class FormAccountComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() action: number | undefined;
  @Input() accountToEdit: account | undefined;
  @Output() closeDialog = new EventEmitter<void>();
  @Output() actionFinished = new EventEmitter<void>();
  actionTitle: string | undefined;
  nameAccount: string | undefined;
  errorMessage: string = '';
  initial_amount: number | undefined;
  target_accountTypeOptions = ['BANCO', 'CAJA'];
  filteredTargetAccount: string[] = [];
  selectedTargetAccount: string = '';
  loadingAction = false;

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private financeService: FinanceService
  ) {}

  onSubmit() {
    this.verifyForm();
    if (this.errorMessage !== '') {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Todos los campos son requeridos',
      });
      return;
    }
    if (this.action === 0) {
      this.createAccount();
    }
    if (this.action === 1) {
      this.editAccount();
    }
  }

  createAccount() {
    this.loadingAction = true;
    this.verifyForm();
    if (this.errorMessage !== '') {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Todos los campos son requeridos',
      });
      this.loadingAction = false;
      return;
    }
    let type = 0;
    if (this.selectedTargetAccount === 'BANCO') {
      type = 1;
    }
    if (this.selectedTargetAccount === 'CAJA') {
      type = 2;
    }

    if (type === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Ha ocurrido un problema, intentelo nuevamnte',
      });
      return;
    }
    let data = {
      name: this.nameAccount,
      type: type,
      initial_amount: this.initial_amount,
    };
    this.financeService.createAccounts(data).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Cuenta creada exitosamente',
        });
        this.loadingAction = false;
        this.actionFinished.emit();
      },
      error: (err) => {
      },
    });
  }

  editAccount() {
    this.loadingAction = true;
    this.verifyForm();
    if (this.errorMessage !== '') {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Todos los campos son requeridos',
      });
      this.loadingAction = false;
      return;
    }
    let type = 0;
    let data: any = {};
    if (this.selectedTargetAccount === 'BANCO') {
      type = 1;
    }
    if (this.selectedTargetAccount === 'CAJA') {
      type = 2;
    }
    if (this.nameAccount !== this.accountToEdit?.name) {
      data.name = this.nameAccount;
    }
    if (type !== this.accountToEdit?.type) {
      data.type = type;
    }
    if (data) {
      this.financeService
        .updateAccount(data, this.accountToEdit?.id || 0)
        .subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Cuenta editada exitosamente',
            });
            this.loadingAction = false;
            this.actionFinished.emit();
          },
          error: (err) => {
          },
        });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Ningun cambio detectado',
      });
    }
  }

  verifyForm() {
    this.errorMessage = '';
    if (
      this.nameAccount === '' ||
      this.selectedTargetAccount === '' ||
      this.initial_amount === 0
    ) {
      this.errorMessage = 'Campo requerido';
    }
  }

  ngOnInit() {
    if (this.action === 0) {
      this.actionTitle = 'Ingresar cuenta';
    }
    if (this.action === 1) {
      this.actionTitle = 'Editar cuenta';
    }
  }

  filterTargetAccount(event: any) {
    const query = event.query.toLowerCase();
    this.filteredTargetAccount = this.target_accountTypeOptions.filter(
      (option) => option.toLowerCase().includes(query)
    );
  }

  resetForm() {
    this.actionTitle = '';
    this.visible = false;
    this.nameAccount = '';
    this.selectedTargetAccount = '';
    this.filteredTargetAccount = [];
    this.initial_amount = undefined;
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

  ngOnChanges(changes: SimpleChanges) {
    if (changes['visible'] && this.visible === true) {
      if (this.action === 0) {
        this.actionTitle = 'Crear cuenta';
      }
      if (this.action === 1) {
        this.actionTitle = 'Editar cuenta';
        if (this.accountToEdit) {
          this.nameAccount = this.accountToEdit.name;
          this.initial_amount = this.accountToEdit.initial_amount;
          this.selectedTargetAccount =
            this.accountToEdit.type === 1 ? 'BANCO' : 'CAJA';
        }
      }
    }
  }

  blockTyping(event: KeyboardEvent) {
    event.preventDefault();
  }
}
