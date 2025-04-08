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
}


@Component({
  selector: 'app-management-tickets',
  imports: [ButtonModule,
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
  providers: [ConfirmationService, MessageService]
})
export class ManagementTicketsComponent implements OnInit {
  code: string = "";
  createTicketDialogVisible: boolean = false;
  tickets: Ticket[] = [];
  viewTicketDialogVisible: boolean = false;
  Ticket?: Ticket;
  currentUrl : string = '';

  constructor (private ticketService: TicketsService, private authService: AuthService, private router: Router){}

  showCreateTicketDialog() {
    this.createTicketDialogVisible = true;
  }

  getTickets() {
    this.ticketService.getTickets().subscribe({
      next: (data) => {
        this.tickets = data;
      },
      error: (error) => {
        console.error('Error al obtener tickets', error);
      },
    });
  }

  ngOnInit() {
    this.getTickets();
    this.currentUrl = this.router.url;
  }

  showViewTicketDialog(ticketId: number) {
    this.ticketService.getTicket(ticketId).subscribe({
      next: (data) => {
        this.Ticket = data;
        console.log("state", this.Ticket!.state);
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
}
