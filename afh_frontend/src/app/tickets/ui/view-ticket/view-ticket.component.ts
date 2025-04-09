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
  imports: [Dialog, ButtonModule, TagModule, NgIf],
  templateUrl: './view-ticket.component.html',
  styleUrl: './view-ticket.component.css',
})
export class ViewTicketComponent {
  @Input() visible: boolean = false;
  @Input() id: number = 0;
  @Input() state: number = 3;
  @Input() date: string = '';
  @Input() description: string = '';
  @Input() place: string = '';
  @Output() closeDialog = new EventEmitter<void>();

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

  changeState(id: number, state: number) {
    console.log(id, state);
    this.ticketService.changeState(id, state).subscribe({
      next: (data) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Estado cambiado',
          detail: 'El estado ha sido cambiado con exito',
        });
      },
      error: (error) => {
        console.error('Error al cambiar el estado', error);
      },
    });
  }
}
