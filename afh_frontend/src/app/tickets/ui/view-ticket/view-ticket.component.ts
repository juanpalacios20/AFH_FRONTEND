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
import { AuthService } from '../../../shared/auth/data_access/auth.service';

interface Tool {
  id: number;
  name: string;
  code: string;
  state: number;
  image: string;
  marca: string;
}

@Component({
  selector: 'app-view-ticket',
  imports: [
    Dialog,
    ButtonModule,
    TagModule,
    NgIf,
    ConfirmDialog,
    NgFor,
    Popover,
  ],
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
  @Input() tools: Tool[] = [];
  @Input() dateEnd: string = '';
  @Output() closeDialog = new EventEmitter<void>();
  @Output() stateChange = new EventEmitter<void>();
  @ViewChild('herramientasPopover') herramientasPopover: any;

  loading: boolean = false;
  loadingComplete: boolean = false;
  change: boolean = false;

  constructor(
    private ticketService: TicketsService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private authService: AuthService
  ) {}

  close() {
    this.visible = false;
    this.closeDialog.emit();
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
        return 'secondary';
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
    this.ticketService.changeState(id, state).subscribe({
      next: (data) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Estado cambiado',
          detail: 'El estado ha sido cambiado con exito',
        });
        this.change = true;
        this.stateChange.emit();
        if (state == 4) {
          this.getPDF(id);
        }
      },
      error: (error) => {
        this.error();
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
        let filename = `solicitud ${this.place}.pdf`;

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
        this.loadingComplete = false;
        this.closeDialog.emit();
      },
      error: (error) => {
        this.error();
      },
    });
  }

  confirm(id: number) {
    this.confirmationService.confirm({
      message:
        'Recuerde haber descargado y llenado la solicitud de herramienta',
      header:
        '¡Advertencia! Está por cambiar el estado de esta solicitud a aceptado',
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
        this.closeDialog.emit();
        this.change = true;
      },
    });
  }

  confirm2(id: number) {
    this.confirmationService.confirm({
      message: '¿Está seguro de completar está accion?',
      header:
        '¡Advertencia! Está por cambiar el estado de esta solicitud a rechazado',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancelar',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Aceptar',
        severity: 'primary'
      },
      accept: () => {
        this.changeState(id, 2);
        this.closeDialog.emit();
        this.change = true;
      },
    });
  }

  confirm3(id: number) {
    this.loadingComplete = true;
    this.confirmationService.confirm({
      message: '¿Está seguro de completar está accion?',
      header:
        '¡Advertencia! Está por cambiar el estado de esta solicitud a finalizada',
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
        this.change = true;
        
      },
    });
  }

  isAdmin(): boolean {
    return this.authService.whoIs();
  }

  togglePopover(event: Event) {
    this.herramientasPopover.toggle(event);
  }

  error() {
    this.messageService.add({
      severity: 'error',
      summary: 'Ha ocurrido un error',
      detail: 'Ha ocurrido un error, intente nuevamente',
    });
  }
}
