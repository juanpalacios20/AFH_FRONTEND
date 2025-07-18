import { Component, OnInit } from '@angular/core';
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
import { CreateTicketComponent } from '../create-ticket/create-ticket.component';
import { TicketsService } from '../../data_access/tickets.service';
import { ViewTicketComponent } from '../view-ticket/view-ticket.component';
import { AuthService } from '../../../shared/auth/data_access/auth.service';
import { Router } from '@angular/router';
import { FooterComponent } from '../../../shared/ui/footer/footer.component';

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
  selector: 'app-management-tickets',
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
    CreateTicketComponent,
    ViewTicketComponent,
    NgIf
  ],
  templateUrl: './management-tickets.component.html',
  styleUrl: './management-tickets.component.css',
  providers: [ConfirmationService, MessageService],
})
export class ManagementTicketsComponent implements OnInit {
  filter: string = '';
  createTicketDialogVisible: boolean = false;
  tickets: Ticket[] = [];
  viewTicketDialogVisible: boolean = false;
  Ticket?: Ticket;
  currentUrl: string = '';
  ticketsActivos: Ticket[] = [];
  loading: boolean = false;
  loadingInfo: boolean = false;
  loadingTickets: boolean = false;

  id: number = 0;
  state: number = 0;
  place: string = '';
  date: string = '';
  description: string = '';
  responsible: string = '';

  constructor(
    private ticketService: TicketsService,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {}

  showCreateTicketDialog() {
    this.createTicketDialogVisible = true;
  }

  handleTicketCreated() {
    this.getTickets();
    this.createTicketDialogVisible = false; 
  }

  handleStateChange() {
    this.getTickets();
  }

  getTickets() {
    this.loadingTickets = true
    this.ticketService.getTickets().subscribe({
      next: (data) => {
        this.tickets = data;

        this.ticketsActivos = data.filter(
          (ticket: Ticket) =>
            ticket.state === 1 || ticket.state === 2 || ticket.state === 3
        );

        this.loadingTickets = false
      },
      error: (error) => {
        this.error()
        this.loadingTickets = false
      },
    });
  }

  ngOnInit() {
    this.getTickets();
    this.currentUrl = this.router.url;
    this.authService.isLoggedIn()
  }

  showViewTicketDialog(ticketId: number) {
    this.ticketService.getTicket(ticketId).subscribe({
      next: (data) => {
        this.id = data.id;
        this.date = data.entry_date_formatted;
        this.place = data.place;
        this.description = data.description;
        this.state = data.state;
        this.responsible = data.responsible;
      },
      error: (error) => {
        this.error()
      },
    });
    this.viewTicketDialogVisible = true;
  }

  getPDF(ticketId: number, place: string): void {
    this.loading = true;

    this.ticketService.getPDF(ticketId).subscribe({
      next: (response) => {
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `solicitud ${place}.pdf`;

        if (contentDisposition) {
          const matches = /filename="(.+)"/.exec(contentDisposition);
          if (matches && matches[1]) {
            filename = matches[1];
          }
        }

        const blob = new Blob([response.body!], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.error()
      },
    });
  }

  getInfo(): void {
    this.loadingInfo = true;

    this.ticketService.getInfo().subscribe({
      next: (response) => {
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `informe.pdf`;

        if (contentDisposition) {
          const matches = /filename="(.+)"/.exec(contentDisposition);
          if (matches && matches[1]) {
            filename = matches[1];
          }
        }

        const blob = new Blob([response.body!], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.loadingInfo = false;
      },
      error: (error) => {
        this.error()
        this.loadingInfo = false;
      },
    });
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
      summary: 'Ha ocurrido un error',
      detail: 'Ha ocurrido un error, intente nuevamente',
    });
  }
}
