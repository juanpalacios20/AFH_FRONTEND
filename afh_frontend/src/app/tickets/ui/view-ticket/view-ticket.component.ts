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
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';

@Component({
  selector: 'app-view-ticket',
  imports: [Dialog, ButtonModule, TagModule, NgIf, ConfirmDialog],
  templateUrl: './view-ticket.component.html',
  styleUrl: './view-ticket.component.css',
  providers: [ConfirmationService],
})
export class ViewTicketComponent {
  @Input() visible: boolean = false;
  @Input() id: number = 0;
  @Input() state: number = 3;
  @Input() date: string = '';
  @Input() description: string = '';
  @Input() place: string = '';
  @Output() closeDialog = new EventEmitter<void>();

  loading: boolean = false;

  constructor(
    private ticketService: TicketsService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
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

  getPDF(ticketId: number): void {
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
    }, 5000);

    this.ticketService.getPDF(ticketId).subscribe({
      next: (response) => {
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'solicitud.pdf';

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
      },
      error: (error) => {
        console.error('Error al obtener PDF', error);
      },
    });
  }

  confirm(id: number) {
    this.confirmationService.confirm({
      message: 'Recuerde haber descargado y llenado la solicitud de herramienta',
      header: '¡Advertencia! Está por cambiar el estado de esta solicitud a aceptado',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancelar',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Aceptar',
        severity: 'primary',
      },
      accept: () => {
        this.changeState(id, 1);
      },
    });
  }

  confirm2(id: number) {
    this.confirmationService.confirm({
      message: '¿Está seguro de completar está accion?',
      header: '¡Advertencia! Está por cambiar el estado de esta solicitud a rechazado',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancelar',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Aceptar',
        severity: 'primary',
      },
      accept: () => {
        this.changeState(id, 2);
      },
    });
  }

  confirm3(id: number) {
    this.confirmationService.confirm({
      message: '¿Está seguro de completar está accion?',
      header: '¡Advertencia! Está por cambiar el estado de esta solicitud a finalizada',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancelar',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Aceptar',
        severity: 'primary',
      },
      accept: () => {
        this.changeState(id, 4);
      },
    });
  }


}
