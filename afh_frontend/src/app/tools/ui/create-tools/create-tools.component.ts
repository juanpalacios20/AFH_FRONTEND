import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { ToolService } from '../../services/tool.service';
import { Router } from '@angular/router';

interface State {
  name: string;
}

interface UploadEvent {
  originalEvent: Event;
  files: File[];
}

@Component({
  selector: 'app-create-tools',
  imports: [
    Dialog,
    ButtonModule,
    FloatLabel,
    FormsModule,
    InputTextModule,
    CommonModule,
    FileUpload,
    ToastModule,
  ],
  templateUrl: './create-tools.component.html',
  styleUrl: './create-tools.component.css',
  providers: [MessageService],
})
export class CreateToolsComponent implements OnInit {
  states: State[] | undefined;
  selectedFile!: File;
  name = '';
  brand = '';
  selectedState: undefined;
  errorMessage: string = '';

  constructor(
    private confirmationService: ConfirmationService,
    private router: Router,
    private messageService: MessageService,
    private toolService: ToolService
  ) {}

  @Input() visible: boolean = false;
  @Input() tool: any = {}; // Herramienta a editar
  @Output() closeDialog = new EventEmitter<void>();

  saveChanges() {
    // Aquí puedes manejar la actualización de la herramienta
    console.log('Herramienta actualizada:', this.tool);
    this.closeDialog.emit(); // Cierra el diálogo después de guardar
  }

  onUpload(event: any): void {
    const uploadEvent = event as UploadEvent;
    this.messageService.add({
      severity: 'info',
      summary: 'Success',
      detail: 'File Uploaded with Basic Mode',
    });
  }

  ngOnInit() {
    this.states = [
      { name: 'ACTIVO' },
      { name: 'INACTIVO' },
      { name: 'EN USO' },
    ];
  }

  resetForm() {
    this.name = '';
    this.brand = '';
    this.selectedState = undefined;
    this.errorMessage = '';
  }

  refreshComponent() {
    this.router.navigateByUrl('/management-tools', { skipLocationChange: true }).then(() => {
      this.router.navigate([this.router.url]); // Vuelve a la misma ruta
    });
  }

  onFileSelected(event: any) {
    if (event.files.length > 0) {
      this.selectedFile = event.files[0];
    }
  }

  showSuccess() {
    if (!this.name || !this.selectedFile) {
      this.errorMessage =
        'Por favor, ingrese un nombre y seleccione una imagen.';
      return;
    }

    this.toolService.addTool(this.name, this.brand, this.selectedFile).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Creada',
          detail: 'La herramienta ha sido creada con éxito',
        });

        setTimeout(() => {
          this.closeDialog.emit();
          this.resetForm();
          this.refreshComponent();
        }, 2000);
      },
      error: (err) => {
        this.errorMessage = 'Error al crear la herramienta.';
        console.error(err);
      },
    });
  }
}
