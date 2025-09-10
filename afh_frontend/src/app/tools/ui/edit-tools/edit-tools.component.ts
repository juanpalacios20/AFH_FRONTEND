import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { ToolService } from '../../services/tool.service';
import { Image } from 'primeng/image';

interface State {
  name: string;
}

@Component({
  selector: 'app-edit-tools',
  imports: [
    Dialog,
    ButtonModule,
    FloatLabel,
    FormsModule,
    InputTextModule,
    CommonModule,
    Select,
    FileUpload,
    ToastModule,
    Image,
  ],
  templateUrl: './edit-tools.component.html',
  styleUrl: './edit-tools.component.css',
})
export class EditToolsComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() tool: any = {};
  @Input() state: string = '';
  @Output() closeDialog = new EventEmitter<void>();
  @Output() onToolEdited = new EventEmitter<void>();

  states: State[] | undefined;
  selectedState: State | undefined;
  selectedFile!: File;
  previewImage: string | ArrayBuffer | null = null;
  errorMessage: string = '';
  loadingEdit: boolean = false;

  originalTool = this.tool;

  constructor(
    private messageService: MessageService,
    private toolService: ToolService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tool'] && changes['tool'].currentValue) {
      this.originalTool = { ...changes['tool'].currentValue }; // Clonamos el objeto
    }
  }

  verify() {
    if (
      this.tool.name === '' ||
      this.tool.marca === '' ||
      this.tool.state === null
    ) {
      this.errorMessage = 'todos los campos son requeridos';
    } else {
      this.errorMessage = '';
    }
  }

  showSuccess() {
    console.log('herramienta a editar', this.tool);
    this.verify();
    if (this.errorMessage !== '') {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Todos los campos son requeridos',
      });
      return;
    }
    if (this.selectedState?.name === 'ACTIVO') {
      this.tool.state = 1;
    } else if (this.selectedState?.name === 'INACTIVO') {
      this.tool.state = 2;
    } else if (this.selectedState?.name === 'EN USO') {
      this.tool.state = 3;
    } else if (this.selectedState?.name === 'EN RESERVA') {
      this.tool.state = 4;
    }
    this.loadingEdit = true;

    const formData = new FormData();
    formData.append('id', this.tool.id.toString());

    if (this.tool.name !== this.originalTool.name) {
      formData.append('name', this.tool.name);
    }

    if (this.tool.marca !== this.originalTool.marca) {
      formData.append('marca', this.tool.marca);
    }

    if (this.selectedState !== this.originalTool.state) {
      formData.append('state', this.tool.state.toString());
    }

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    if (formData) {
      this.toolService.updateTool(this.tool.id, formData).subscribe({
        next: (response: any) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Actualizado',
            detail: 'La herramienta ha sido actualizada con éxito',
          });
          localStorage.removeItem('tools');
          this.closeDialog.emit();
          this.onToolEdited.emit();
          this.loadingEdit = false;
        },
        error: (error) => {
          this.error();
        },
      });
    }
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

  ngOnInit(): void {
    this.states = [
      { name: 'ACTIVO' },
      { name: 'INACTIVO' },
      { name: 'EN USO' },
      { name: 'EN RESERVA' },
    ];
  }

  close() {
    this.errorMessage = '';
    this.visible = false;
    this.closeDialog.emit();
  }

  error() {
    this.messageService.add({
      severity: 'error',
      summary: 'Ha ocurrido un error',
      detail: 'Ha ocurrido un error, intente nuevamente',
    });
  }
}
