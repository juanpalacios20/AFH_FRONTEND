import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToolService } from '../../../tools/services/tool.service';
import { CookieService } from 'ngx-cookie-service';
import { TicketsService } from '../../data_access/tickets.service';
import { TextareaModule } from 'primeng/textarea';
import { MessageService } from 'primeng/api';

interface Tool {
  id: number;
  code: string;
  marca: string;
  image?: string;
  state?: number;
}

@Component({
  selector: 'app-create-ticket',
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
  templateUrl: './create-ticket.component.html',
  styleUrl: './create-ticket.component.css',
})
export class CreateTicketComponent {
  place: string = '';
  description: string = '';
  email: string = '';
  tools: Tool[] = [];
  selectedTools: Tool[] = [];
  selectedToolsIds: number[] = [];
  loading: boolean = false;
  toolErrorMessage: string = '';
  placeErrorMessage: string = '';
  descriptionErrorMessage: string = '';

  @Input() visible: boolean = false;
  @Output() closeDialog = new EventEmitter<void>();
  @Output() onTicketCreated = new EventEmitter<void>();

  constructor(
    private cookieService: CookieService,
    private ticketService: TicketsService,
    private toolService: ToolService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.getEmail();
    this.toolService.getTools().subscribe({
      next: (data) => {
        this.tools = data.filter(
          (tool: Tool) =>
            tool.state === 1
        );

      },
      error: (error) => {
        console.error('Error al obtener herramientas', error);
      },
    });
  }

  getEmail() {
    this.email = localStorage.getItem('email') || '';
  }

  error() {
    this.messageService.add({
      severity: 'error',
      summary: 'Ha ocurrido un error',
      detail: 'Ha ocurrido un error, intente nuevamente',
    });
  }

  addTicket() {
    this.verify();
    if (
      this.placeErrorMessage != '' ||
      this.descriptionErrorMessage != '' ||
      this.toolErrorMessage != ''
    ) {
      return;
    }
    this.loading = true;
    for (let i = 0; i < this.selectedTools.length; i++) {
      this.selectedToolsIds.push(this.selectedTools[i].id);
    }
    this.ticketService
      .addTicket(
        this.selectedToolsIds,
        this.description,
        this.email,
        this.place
      )
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Creada',
            detail: 'La herramienta ha sido creada con éxito',
          });
          this.closeDialog.emit();
          this.onTicketCreated.emit();
          this.resetForm();
          this.loading = false;
        },
        error: (err) => {
          console.error('Error al crear el ticket:', err);
          this.loading = false;
          this.error()
        },
      });
  }

  resetForm() {
    this.place = '';
    this.description = '';
    this.selectedTools = [];
    this.selectedToolsIds = [];
    this.toolErrorMessage = '';
    this.placeErrorMessage = '';
    this.descriptionErrorMessage = '';
  }

  close() {
    this.visible = false;
    this.closeDialog.emit();
    this.resetForm();
  }

  verify() {
    if (this.selectedTools.length == 0) {
      this.toolErrorMessage = 'Debes seleccionar al menos una herramienta';
    }
    if (this.place == '') {
      this.placeErrorMessage = 'Debes ingresar un lugar';
    }
    if (this.description == '') {
      this.descriptionErrorMessage = 'Debes ingresar una descripcion';
    }
    if (this.selectedTools.length > 0) {
      this.toolErrorMessage = '';
    }
    if (this.place !== '') {
      this.placeErrorMessage = '';
    }
    if (this.description !== '') {
      this.descriptionErrorMessage = '';
    }
  }
}
