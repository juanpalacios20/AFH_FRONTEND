import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ClientService } from '../../services/client.service';

@Component({
  selector: 'app-form-clients',
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
  ],
  templateUrl: './form-clients.component.html',
  styleUrl: './form-clients.component.css',
  providers: [MessageService],
})
export default class FormClientsComponent implements OnChanges {
  actionTittle: string = '';
  name: string = '';
  email: string = '';
  phone: string = '';
  position: string = '';
  errorMessageName: string = '';
  errorMessageEmail: string = '';
  errorMessagePhone: string = '';
  errorMessagePosition: string = '';
  @Input() visible: boolean = false;
  @Input() action: number = 0; // 0: create, 1: edit
  @Input() clientId: number | null = null;
  @Input() nameClient: string = '';
  @Input() emailClient: string = '';
  @Input() phoneClient: string = '';
  @Input() positionClient: string = '';
  @Output() closeDialog = new EventEmitter<void>();
  @Output() onQuoteCreated = new EventEmitter<void>();
  @Output() isEdited = new EventEmitter<boolean>();

  constructor(
    private messageService: MessageService,
    private clientService: ClientService
  ) {}

  close() {
    this.name = '';
    this.email = '';
    this.phone = '';
    this.errorMessageName = '';
    this.errorMessageEmail = '';
    this.errorMessagePhone = '';
    this.errorMessagePosition = '';
    this.visible = false;
    this.closeDialog.emit();
  }

  verifyFields() {
    if (this.name === '') {
      this.errorMessageName = 'El nombre es obligatorio';
    }
    if (this.email === '') {
      this.errorMessageEmail = 'El email es obligatorio';
    }
    if (this.phone === '') {
      this.errorMessagePhone = 'El teléfono es obligatorio';
    }
    if (!(this.email.includes('@') && this.email.includes('.com'))) {
      this.errorMessageEmail =
        'El correo electrónico es inválido, ejemplo@dominio.com';
    }
    if (this.position === '') {
      this.errorMessagePosition = 'El cargo es obligatorio';
    }
  }

  createClient() {
    this.verifyFields();
    if (
      this.errorMessageName === 'El nombre es obligatorio' ||
      this.errorMessageEmail === 'El email es obligatorio' ||
      this.errorMessagePhone === 'El teléfono es obligatorio' ||
      this.errorMessageEmail ===
        'El correo electrónico es inválido, ejemplo@dominio.com' ||
      this.errorMessagePosition === 'El cargo es obligatorio'
    ) {
      return;
    }
    this.clientService
      .createClient(this.name, this.email, this.phone, this.position)
      .subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Cliente creado correctamente',
          });
          this.close();
          this.onQuoteCreated.emit();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al crear el cliente',
          });
          console.error('Error al crear el cliente:', error);
        },
      });
  }

  UpdateClient() {
    this.verifyFields();
    if (
      this.errorMessageName === 'El nombre es obligatorio' ||
      this.errorMessageEmail === 'El email es obligatorio' ||
      this.errorMessagePhone === 'El teléfono es obligatorio' ||
      this.errorMessageEmail ===
        'El correo electrónico es inválido, ejemplo@dominio.com' ||
      this.errorMessagePosition === 'El cargo es obligatorio'
    ) {
      return;
    }
    const formData = new FormData();
    if (this.name !== this.nameClient) {
      formData.append('name', this.name);
    }
    if (this.email !== this.emailClient) {
      formData.append('email', this.email);
    }
    if (this.phone !== this.phoneClient) {
      formData.append('phone', this.phone);
    }
    if (this.position !== this.positionClient) {
      formData.append('post', this.position);
    }
    if (
      this.name === this.nameClient &&
      this.email === this.emailClient &&
      this.phone === this.phoneClient &&
      this.position === this.positionClient
    ) {
      this.close();
      this.onQuoteCreated.emit();
      console.log('No hay cambios para actualizar');
      return;
    }
    this.clientService.updateClient(this.clientId!, formData).subscribe({
      next: (response) => {
        this.isEdited.emit(true);
        this.close();
        this.onQuoteCreated.emit();
        console.log('Cliente actualizado');
      },
      error: (error) => {
        console.error('Error al actualizar el cliente:', error);
      },
    });
  }

  handleAction() {
    if (this.action === 0) {
      this.createClient();
    } else if (this.action === 1 && this.clientId) {
      this.UpdateClient();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['visible'] && this.visible) {
      if (this.action === 0) {
        this.actionTittle = 'Crear nuevo cliente';
      } else if (this.action === 1) {
        this.actionTittle = 'Editar cliente';
      }
      if (this.action === 1 && this.clientId !== null) {
        this.name = this.nameClient;
        this.email = this.emailClient;
        this.phone = this.phoneClient;
        this.position = this.positionClient || '';
      }
    }
  }
}
