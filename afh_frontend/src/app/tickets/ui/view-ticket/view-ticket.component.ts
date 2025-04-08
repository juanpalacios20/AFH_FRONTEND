import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { TicketsService } from '../../data_access/tickets.service';
import { TagModule } from 'primeng/tag';
import { NgFor, NgIf } from '@angular/common';
import { Popover } from 'primeng/popover';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-view-ticket',
  imports: [Dialog, ButtonModule, TagModule, NgFor, Popover, NgIf],
  templateUrl: './view-ticket.component.html',
  styleUrl: './view-ticket.component.css',
})
export class ViewTicketComponent {
  @Input() ticket: any;
  @Input() visible: boolean = false;
  @Output() closeDialog = new EventEmitter<void>();
  @ViewChild('herramientasPopover') herramientasPopover: any;

  constructor(
    private ticketService: TicketsService,
    private messageService: MessageService
  ) {}

  close() {
    this.visible = false;
    this.closeDialog.emit();
    window.location.reload();
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

  togglePopover(event: Event) {
    this.herramientasPopover.toggle(event);
  }

  changeState(id: number, state: number) {
    console.log(id, state);
    this.ticketService.changeState(id, state).subscribe({
      next: (data) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Estado cambiado',
          detail: 'El estado ha sido cambiado con exito',
        });
        this.ticket.state = state;
      },
      error: (error) => {
        console.error('Error al cambiar el estado', error);
      },
    });
  }
}
