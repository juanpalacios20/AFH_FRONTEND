import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { MenuComponent } from '../../../shared/ui/menu/menu.component';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { RatingModule } from 'primeng/rating';
import { CommonModule, NgIf } from '@angular/common';
import { InputIconModule } from 'primeng/inputicon';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ViewTicketComponent } from '../view-ticket/view-ticket.component';
import { TicketsService } from '../../data_access/tickets.service';
import { AuthService } from '../../../shared/auth/data_access/auth.service';
import { GlobalService } from '../../../global.service';
import { LocalStorageService } from '../../../localstorage.service';
import { tick } from '@angular/core/testing';

interface Tool {
  id: number;
  name: string;
  code: string;
  state: number;
  image: string;
  marca: string;
}

interface User {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface Receiver {
  id: number;
  user: User;
  role: number;
}

interface Applicant {
  id: number;
  user: User;
  role: number;
}

interface Ticket {
  id: number;
  tools: Tool[];
  description: string;
  applicant: Applicant;
  receiver: Receiver;
  place: string;
  state: number;
  entry_date_formatted: string;
  departure_date_formatted: string;
  responsible: string;
}

@Component({
  selector: 'app-history-tickets',
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
    ViewTicketComponent,
  ],
  templateUrl: './history-tickets.component.html',
  styleUrl: './history-tickets.component.css',
  providers: [ConfirmationService, MessageService],
})
export class HistoryTicketsComponent {
  ticketsFinalizados: Ticket[] = [];
  code: string = '';
  createTicketDialogVisible: boolean = false;
  tickets: Ticket[] = [];
  viewTicketDialogVisible: boolean = false;
  Ticket?: Ticket;
  loadingTickets: boolean = false;

  id: number = 0;
  state: number = 0;
  place: string = '';
  date: string = '';
  description: string = '';
  dateEnd: string = '';
  responsible: string = '';
  tools: Tool[] = [];

  constructor(
    private ticketService: TicketsService,
    private authService: AuthService,
    private messageService: MessageService,
    private globalService: GlobalService,
    private localStorageService: LocalStorageService
  ) {
    this.globalService.changeTitle('AFH: Historial Vales');
  }

  showCreateTicketDialog() {
    this.createTicketDialogVisible = true;
  }

  getTickets() {
    this.loadingTickets = true;
    const ticketsLS: Ticket[] | null =
      this.localStorageService.getItem('historialTickets');
    if (ticketsLS && ticketsLS.length > 0) {
      this.tickets = ticketsLS;
    } else {
      this.ticketService.getTickets().subscribe({
        next: (data) => {
          this.tickets = data;
          this.ticketsFinalizados = data.filter(
            (ticket: Ticket) => ticket.state === 4
          );
          this.localStorageService.setItem('historialTickets', this.ticketsFinalizados);
          this.loadingTickets = false;
        },
        error: (error) => {
          this.error();
        },
      });
    }
  }

  ngOnInit() {
    this.getTickets();
  }

  showViewTicketDialog(ticketId: number) {
    this.ticketService.getTicket(ticketId).subscribe({
      next: (data) => {
        this.id = data.id;
        this.date = data.entry_date_formatted;
        this.place = data.place;
        this.description = data.description;
        this.state = data.state;
        this.tools = data.tools;
        this.dateEnd = data.departure_date_formatted;
        this.responsible = data.responsible;
      },
      error: (error) => {
        console.error('Error al obtener ticket', error);
      },
    });
    this.viewTicketDialogVisible = true;
  }

  getSeverity(
    state: number
  ):
    | 'success'
    | 'warn'
    | 'danger'
    | 'secondary'
    | 'info'
    | 'contrast'
    | undefined {
    switch (state) {
      case 1:
        return 'success';
      case 2:
        return 'danger';
      case 3:
        return 'warn';
      case 4:
        return 'secondary';
      default:
        return 'secondary'; // Map "unknown" to a valid type
    }
  }

  getStateString(state: number): string {
    switch (state) {
      case 1:
        return 'ACEPTADO';
      case 2:
        return 'RECHAZADO';
      case 3:
        return 'EN ESPERA';
      case 4:
        return 'FINALIZADO';
      default:
        return 'Estado desconocido';
    }
  }

  isAdmin(): boolean {
    return this.authService.whoIs();
  }

  error() {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Ha ocurrido un error',
    });
  }
}
