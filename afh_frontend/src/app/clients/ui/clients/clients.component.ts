import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { MenuComponent } from '../../../shared/ui/menu/menu.component';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { CommonModule } from '@angular/common';
import { RatingModule } from 'primeng/rating';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import FormClientsComponent from '../form-clients/form-clients.component';
import { ClientService } from '../../services/client.service';

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  post: string;
}

@Component({
  selector: 'app-clients',
  imports: [
    ButtonModule,
    RippleModule,
    MenuComponent,
    TableModule,
    TagModule,
    RatingModule,
    CommonModule,
    InputIconModule,
    IconFieldModule,
    InputTextModule,
    FloatLabelModule,
    FormsModule,
    ConfirmDialog,
    ToastModule,
    FormClientsComponent,
  ],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.css',
  providers: [ConfirmationService, MessageService],
})
export default class ClientsComponent implements OnInit {
  clients: Client[] = [];
  searchClient: string = '';
  clientDialogVisible: boolean = false;
  clientEditVisible: boolean = false;
  name: string = '';
  email: string = '';
  phone: string = '';
  id: number = 0;
  action: number = 0;
  position: string = '';
  isEdited: boolean = false;

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private clientService: ClientService
  ) {}

  ngOnInit() {
    this.getClients();
  }
  getClients() {
    this.clientService.getClients().subscribe({
      next: (response: any) => {
        this.clients = response;
      },
      error: (error: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load clients',
        });
      },
    });
  }

  showCreateClientDialog() {
    this.action = 0;
    this.clientDialogVisible = true;
  }

  handClientCreated() {
    this.clientDialogVisible = false;
    this.getClients();

    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Cliente creado correctamente',
    });
  }

  showEditClientDialog(
    idClient: number,
    nameClient: string,
    emailClient: string,
    phoneClient: string,
    positionClient: string
  ) {
    this.action = 1;
    this.clientEditVisible = true;
    this.id = idClient;
    this.name = nameClient;
    this.email = emailClient;
    this.phone = phoneClient;
    this.position = positionClient;
  }

  handleIsEdited(event: boolean) {
    this.isEdited = event;
  }

  handleClientEdit() {
    console.log(this.isEdited);
    this.clientEditVisible = false;
    this.getClients();
    if (this.isEdited) {
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Cliente editado correctamente',
      });
    }
    this.isEdited = false;
  }

  deleteClient(id: number) {
    this.clientService.deleteClient(id).subscribe({
      next: (response: any) => {
        this.getClients();
      },
      error: (error: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al eliminar el cliente, intentelo nuevamente',
        });
      },
    });
  }

  confirmationDelete(id: number) {
    this.confirmationService.confirm({
      message:
        '¿Está seguro que desea eliminar este cliente? Esta acción no se puede deshacer.',
      header: '¡Advertencia!',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancelar',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Eliminar',
        severity: 'danger',
      },
      accept: () => {
        this.deleteClient(id);
        this.messageService.add({
          severity: 'success',
          summary: 'Exito',
          detail: 'Cliente eliminado con éxito',
        });
      },
    });
  }
}
