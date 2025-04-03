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

interface UploadEvent {
  originalEvent: Event;
  files: File[];
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
  states: State[] | undefined;
  selectedState: State | undefined;
  selectedFile!: File;
  previewImage: string | ArrayBuffer | null = null;

  constructor(
    private messageService: MessageService,
    private toolService: ToolService
  ) {}

  @Input() visible: boolean = false;
  @Input() tool: any = {};
  @Input() state: string = '';
  @Output() closeDialog = new EventEmitter<void>();

  updateTool() {
    console.log('Selected State:', this.selectedState?.name); // Debugging
  
    if (this.selectedState?.name === 'ACTIVO') {
      this.tool.state = 1;
    } else if (this.selectedState?.name === 'INACTIVO') {
      this.tool.state = 2;
    } else if (this.selectedState?.name === 'EN USO') {
      this.tool.state = 3;
    }
  
    console.log('Tool State after assignment:', this.tool.state); // Debugging
  
    this.toolService
      .updateTool(
        this.tool.id,
        this.tool.name,
        this.tool.marca,
        this.selectedFile, 
        this.tool.state
      )
      .subscribe(
        (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Herramienta actualizada',
          });
          setTimeout(() => {
            this.closeDialog.emit();
            window.location.reload();
          }, 2000);
        },
        (error) => {
          console.error('Error al actualizar herramienta:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar la herramienta',
          });
        }
      );
  }
  

  onFileSelected(event: any) {
    if (event.files.length > 0) {
      this.selectedFile = event.files[0];

      // Crear vista previa de la imagen seleccionada
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewImage = reader.result; // Guardar la vista previa
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  ngOnInit(): void {
    console.log('Estado inicial recibido:', this.state); // Debugging
  
    this.states = [
      { name: 'ACTIVO' },
      { name: 'INACTIVO' },
      { name: 'EN USO' },
    ];
  }
  

  ngOnChanges(changes: SimpleChanges) {
    if (changes['state']) {
      console.log('ngOnChanges - Estado cambiado:', this.state);
    }
  }
}
