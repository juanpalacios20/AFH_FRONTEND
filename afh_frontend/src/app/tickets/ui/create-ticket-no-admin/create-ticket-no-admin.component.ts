import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToastModule } from 'primeng/toast';
import { TextareaModule } from 'primeng/textarea';
import { CookieService } from 'ngx-cookie-service';
import { TicketsService } from '../../data_access/tickets.service';
import { ToolService } from '../../../tools/services/tool.service';
import { MenuComponent } from '../../../shared/ui/menu/menu.component';

interface Tool {
  id: number;
  code: string;
  marca: string;
  image?: string;
  state?: number;
}

@Component({
  selector: 'app-create-ticket-no-admin',
  imports: [
    ButtonModule,
    FloatLabel,
    FormsModule,
    InputTextModule,
    CommonModule,
    ToastModule,
    MultiSelectModule,
    TextareaModule,
    MenuComponent
  ],
  templateUrl: './create-ticket-no-admin.component.html',
  styleUrl: './create-ticket-no-admin.component.css',
})
export class CreateTicketNoAdminComponent {
  place: string = '';
  description: string = '';
  email: string = '';
  tools: Tool[] = [];
  selectedTools: Tool[] = [];
  selectedToolsIds: number[] = [];

  constructor(
    private cookieService: CookieService,
    private ticketService: TicketsService,
    private toolService: ToolService
  ) {}

  ngOnInit(): void {
    this.getEmail();
    this.toolService.getTools().subscribe({
      next: (data) => {
        this.tools = data;
      },
      error: (error) => {
        console.error('Error al obtener herramientas', error);
      },
    });
  }

  getEmail() {
    this.email = this.cookieService.get('email');
  }

  addTicket() {
    for (let i = 0; i < this.selectedTools.length; i++) {
      this.selectedToolsIds.push(this.selectedTools[i].id);
    }
    this.ticketService
      .addTicket(this.selectedToolsIds, this.description, this.email, this.place)
      .subscribe({
        next: () => {
          alert('Ticket creado con éxito');
          //this.resetForm();
        },
        error: (err) => {
          console.error('Error al crear el ticket:', err);
          alert('Error al crear el ticket. Por favor, inténtalo de nuevo.');
        },
      });
  }

  resetForm() {
    this.place = '';
    this.description = '';
    this.selectedTools = [];
    this.selectedToolsIds = [];
}
}
