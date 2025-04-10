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
import { Image } from 'primeng/image';

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
    Image,
  ],
  templateUrl: './create-tools.component.html',
  styleUrl: './create-tools.component.css',
})
export class CreateToolsComponent {
  @Input() visible: boolean = false;
  @Output() closeDialog = new EventEmitter<void>();

  states: State[] | undefined;
  selectedFile!: File;
  name = '';
  brand = '';
  selectedState: undefined;
  errorMessage: string = '';
  previewImage: string | ArrayBuffer | null = null;
  errorNameMessage: string = '';
  errorBrandMessage: string = '';
  errorImageMessage: string = '';

  constructor(
    private confirmationService: ConfirmationService,
    private router: Router,
    private messageService: MessageService,
    private toolService: ToolService
  ) {}

  close() {
    this.visible = false;
    this.closeDialog.emit();
    this.resetForm();
  }

  resetForm() {
    this.name = '';
    this.brand = '';
    this.selectedState = undefined;
    this.errorMessage = '';
    this.previewImage = null;
    this.errorNameMessage = '';
    this.errorBrandMessage = '';
    this.errorImageMessage = '';
    this.selectedFile = new File([], '');
  }

  onFileSelected(event: any) {
    if (event.files.length > 0) {
      this.selectedFile = event.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewImage = reader.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  showSuccess() {
    this.verifyForm();
    if (
      this.errorNameMessage == 'Por favor, ingrese un nombre.' ||
      this.errorBrandMessage == 'Por favor, ingrese una marca.' ||
      this.errorImageMessage == 'Por favor, seleccione una imagen.'
    ) {
      console.log('Error en el formulario');
      return;
    }

    this.toolService
      .addTool(this.name, this.brand, this.selectedFile)
      .subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Creada',
            detail: 'La herramienta ha sido creada con éxito',
          });
          this.closeDialog.emit();
          this.resetForm();
          window.location.reload();
        },
        error: (err) => {
          this.error()
        },
      });
  }

  verifyForm() {
    if (this.name == '') {
      this.errorNameMessage = 'Por favor, ingrese un nombre.';
    }
    if (this.brand == '')
      this.errorBrandMessage = 'Por favor, ingrese una marca.';

    if (!this.selectedFile) {
      this.errorImageMessage = 'Por favor, seleccione una imagen.';
    }
  }

  error() {
    this.messageService.add({
      severity: 'danger',
      summary: 'Ha ocurrido un error',
      detail: 'Ha ocurrido un error, intente nuevamente',
    });
  }
}
