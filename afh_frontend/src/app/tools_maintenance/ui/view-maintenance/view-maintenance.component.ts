import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ToolsMaintenance } from '../../../interfaces/models';
import { Image } from 'primeng/image';
import { Dialog } from 'primeng/dialog';
import { ToolsMaintenanceService } from '../../services/maintenance.service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-view-maintenance',
  imports: [Image, Dialog, ButtonModule],
  templateUrl: './view-maintenance.component.html',
  styleUrl: './view-maintenance.component.css',
})
export default class ViewMaintenanceComponent {
  @Input() visible: boolean = false;
  @Input() maintenance: ToolsMaintenance | undefined;
  @Output() closeDialog = new EventEmitter<void>();
  loadingPDF: boolean = false;

  constructor(private maintenanceService: ToolsMaintenanceService) {}

  close() {
    this.visible = false;
    this.loadingPDF = false;
    this.closeDialog.emit();
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
}
