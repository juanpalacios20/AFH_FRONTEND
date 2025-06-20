import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Dialog } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { OrderWork } from '../../../interfaces/models';
import { OrderWorkService } from '../../services/work_order.service';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-view-orders-work',
  imports: [
    Dialog,
    ButtonModule,
    TagModule,
    ToastModule,
    CommonModule,
    ButtonModule,
    ConfirmDialog,
    NgIf,
  ],
  templateUrl: './view-orders-work.component.html',
  styleUrl: './view-orders-work.component.css',
})
export default class ViewOrdersWorkComponent {
  loadingDownload = false;
  @Input() orderWork: OrderWork | null = null;
  @Input() visible: boolean = false;
  @Output() closeDialog = new EventEmitter<void>();

  constructor(
    private orderWorkService: OrderWorkService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  close() {
    this.visible = false;
    this.closeDialog.emit();
  }

  pdfOrderWork(): void {
    this.loadingDownload = true;

    this.orderWorkService.workOrderPdf(this.orderWork?.id || 0).subscribe({
      next: (response) => {
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `orden de trabajo ${this.orderWork?.quote.code}.pdf`;

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

  finishOrderWork() {
    if (this.orderWork) {
      this.orderWorkService.finishOrderWork(this.orderWork.id).subscribe({
        next: (response) => {
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
