import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { QuoteService } from '../../services/quote.service';
import { OrderWorkService } from '../../../order_works/services/work_order.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { OrderWork, Quote } from '../../../interfaces/models';
import { LocalStorageService } from '../../../localstorage.service';

@Component({
  selector: 'app-view-quotes',
  imports: [
    Dialog,
    ButtonModule,
    TagModule,
    NgFor,
    ToastModule,
    CommonModule,
    ButtonModule,
    ConfirmDialog,
    NgIf,
  ],
  templateUrl: './view-quotes.component.html',
  styleUrl: './view-quotes.component.css',
  providers: [ConfirmationService, MessageService],
})
export default class ViewQuotesComponent {
  loadingDownload = false;
  @Input() orderWork: OrderWork | null = null;
  @Input() quote: Quote | null = this.orderWork?.quote || null;
  @Input() state: string = '';
  @Input() severity:
    | 'success'
    | 'warn'
    | 'danger'
    | 'secondary'
    | 'info'
    | 'contrast'
    | undefined = 'info';
  @Input() visible: boolean = false;
  @Output() closeDialog = new EventEmitter<void>();
  temporalState: string = '';
  temporalSeverity:
    | 'success'
    | 'warn'
    | 'danger'
    | 'secondary'
    | 'info'
    | 'contrast'
    | undefined = undefined;

  constructor(
    private quoteService: QuoteService,
    private orderWorkService: OrderWorkService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private localStorageService: LocalStorageService
  ) {}

  showDialog() {
    this.visible = true;
  }

  close() {
    this.visible = false;
    this.temporalSeverity = undefined;
    this.temporalState = '';
    this.closeDialog.emit();
  }

  pdf(): void {
    if (this.orderWork) {
      this.pdfOrderWork();
    } else {
      this.pdfQuote();
    }
  }

  pdfQuote(): void {
    this.loadingDownload = true;

    this.quoteService.getPDF(this.quote?.id || 0).subscribe({
      next: (response) => {
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `cotización ${this.quote?.code}.pdf`;

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
        this.loadingDownload = false;
      },
      error: (error) => {
        this.loadingDownload = false;
        console.log(error);
      },
    });
  }

  pdfOrderWork(): void {
    this.loadingDownload = true;

    this.orderWorkService.workOrderPdf(this.orderWork?.id || 0).subscribe({
      next: (response) => {
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `orden de trabajo ${this.quote?.code}.pdf`;

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
        this.loadingDownload = false;
      },
      error: (error) => {
        this.loadingDownload = false;
        console.log(error);
      },
    });
  }

  changeState(state: number) {
    const data = {
      state: state,
    };
    this.quoteService.changeState(this.quote?.id || 0, data).subscribe({
      next: (response) => {
        this.localStorageService.removeItem('quotes');
      },
      error: (error) => {
        console.error('Error changing state:', error);
      },
    });

    if (state === 2) {
      this.temporalState = 'APROBADO';
      this.temporalSeverity = 'success';
    }
    if (state === 3) {
      this.temporalState = 'RECHAZADO';
      this.temporalSeverity = 'danger';
    }
  }

  finishOrderWork() {
    if (this.orderWork) {
      this.orderWorkService.finishOrderWork(this.orderWork.id).subscribe({
        next: (response) => {
          this.localStorageService.removeItem('quotes');
          const today = new Date();
          const year = today.getFullYear();
          const month = String(today.getMonth() + 1).padStart(2, '0'); // enero es 0
          const day = String(today.getDate()).padStart(2, '0');
          const formattedDate = `${year}/${month}/${day}`;

          if (this.orderWork) {
            this.orderWork.end_date = formattedDate;
          }
        },
        error: (err) => {
          console.error('Error finishing order work', err);
        },
      });
    }
  }

  confirmationConfirm() {
    this.confirmationService.confirm({
      message:
        '¿Está seguro que desea APROBAR la cotización? Esta acción NO se puede deshacer.',
      header: '¡Advertencia! Lea con atención.',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancelar',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Aceptar',
      },
      accept: () => {
        this.changeState(2);
        this.messageService.add({
          severity: 'success',
          summary: 'Exito',
          detail: 'La cotización ha sido aprobada con éxito',
        });
      },
    });
  }

  confirmationReject() {
    this.confirmationService.confirm({
      message:
        '¿Está seguro que desea RECHAZAR la cotización? Esta acción NO se puede deshacer.',
      header: '¡Advertencia! Lea con atención.',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancelar',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Aceptar',
      },
      accept: () => {
        this.changeState(3);
        this.messageService.add({
          severity: 'success',
          summary: 'Exito',
          detail: 'La cotización ha sido rechazada con éxito',
        });
      },
    });
  }

  confirmationComplete() {
    this.confirmationService.confirm({
      message:
        '¿Está seguro que desea FINALIZAR el acta? Esta acción NO se puede deshacer.',
      header: '¡Advertencia! Lea con atención.',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancelar',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Aceptar',
      },
      accept: () => {
        this.finishOrderWork();
        this.messageService.add({
          severity: 'success',
          summary: 'Exito',
          detail: 'Acta finalizada con éxito',
        });
      },
    });
  }
}
