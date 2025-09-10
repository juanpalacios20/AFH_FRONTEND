import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ToolsMaintenance } from '../../../interfaces/models';
import { Image } from 'primeng/image';
import { Dialog } from 'primeng/dialog';
import { ToolsMaintenanceService } from '../../services/maintenance.service';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { LocalStorageService } from '../../../localstorage.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-view-maintenance',
  imports: [Image, Dialog, ButtonModule, ToastModule, ConfirmDialog, NgClass],
  templateUrl: './view-maintenance.component.html',
  styleUrl: './view-maintenance.component.css',
  providers: [ConfirmationService, MessageService],
})
export default class ViewMaintenanceComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() maintenance: ToolsMaintenance | undefined;
  @Output() closeDialog = new EventEmitter<void>();
  loadingPDF: boolean = false;
  itsComplete: boolean = false;

  constructor(
    private maintenanceService: ToolsMaintenanceService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private localStorage: LocalStorageService
  ) {}

  ngOnInit(): void {
    this.isComplete();
  }

  close() {
    this.visible = false;
    this.loadingPDF = false;
    this.itsComplete = false;
    this.closeDialog.emit();
  }

  isComplete() {
    if (this.maintenance?.delivery_date) {
      const maintenanceDate = new Date(this.maintenance.delivery_date);
      const today = new Date();

      maintenanceDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      if (maintenanceDate < today || this.maintenance.tool.state !== 5) {
        this.itsComplete = true;
      }
    }
    console.log(this.itsComplete);
  }

  confirmationComplete() {
    this.confirmationService.confirm({
      message:
        '¿Está seguro que desea FINALIZAR el mantenimiento? Esta acción NO se puede deshacer.',
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
        this.messageService.add({
          severity: 'success',
          summary: 'Exito',
          detail: 'Mantenimiento finalizado con éxito',
        });
        this.finishMaintenance();
      },
    });
  }

  finishMaintenance() {
    this.maintenanceService
      .finishMaintenance(this.maintenance?.id || 0)
      .subscribe({
        next: (response) => {
          this.localStorage.removeItem('maintenances');
          this.localStorage.removeItem('tools');
          this.localStorage.removeItem('toolsAvailable');
          this.closeDialog.emit();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Ha ocurrido un problema, intentelo nuevamente',
          });
        },
      });
  }

  getPDF() {
    this.loadingPDF = true;
    this.maintenanceService
      .pdfMaintenance(this.maintenance?.id || 0)
      .subscribe({
        next: (response) => {
          // Crear el blob desde la respuesta solo si response.body no es null
          if (response.body) {
            const blob = new Blob([response.body], { type: 'application/pdf' });

            // Crear una URL para el blob
            const url = window.URL.createObjectURL(blob);

            // Crear un enlace temporal para descargar
            const link = document.createElement('a');
            link.href = url;
            link.download = `ticket mantenimiento ${this.maintenance?.tool?.name}-${this.maintenance?.date}`; // Nombre del archivo
            link.click();
            window.open(url, '_blank'); // Abre en nueva pestaña
            window.URL.revokeObjectURL(url);
            // Liberar la URL temporal
            window.URL.revokeObjectURL(url);
            this.loadingPDF = false;
          } else {
            console.error('La respuesta no contiene datos PDF.');
            this.loadingPDF = false;
          }
        },
        error: (err) => {
          console.error('Error al descargar PDF:', err);
          this.loadingPDF = false;
        },
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['visible'] && this.visible === true) {
      this.isComplete();
    }
  }
}
