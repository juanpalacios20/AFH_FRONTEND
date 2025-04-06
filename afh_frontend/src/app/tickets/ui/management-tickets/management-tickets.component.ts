import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { MenuComponent } from '../../../shared/ui/menu/menu.component';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { RatingModule } from 'primeng/rating';
import { CommonModule } from '@angular/common';
import { InputIconModule } from 'primeng/inputicon';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CreateTicketComponent } from '../create-ticket/create-ticket.component';

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
    CreateTicketComponent],
  templateUrl: './management-tickets.component.html',
  styleUrl: './management-tickets.component.css',
  providers: [ConfirmationService, MessageService]
})
export class ManagementTicketsComponent {
  code: string = "";
  createTicketDialogVisible: boolean = false;

  showCreateTicketDialog() {
    this.createTicketDialogVisible = true;
  }
}
