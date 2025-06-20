import { CommonModule, NgIf } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AutoComplete, AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { OrderWorkService } from '../../../order_works/services/work_order.service';
import { FileUpload } from 'primeng/fileupload';
import { Image } from 'primeng/image';
import { WorkReportService } from '../../services/work_report.service';
import { OrderWork } from '../../../interfaces/models';

@Component({
  selector: 'app-form-work',
  imports: [
    Dialog,
    ButtonModule,
    FloatLabel,
    FormsModule,
    InputTextModule,
    CommonModule,
    ToastModule,
    MultiSelectModule,
    TextareaModule,
    AutoComplete,
    ToastModule,
    FileUpload,
    Image,
  ],
  templateUrl: './form-work.component.html',
  styleUrl: './form-work.component.css',
  providers: [MessageService, AutoCompleteModule],
})
export default class FormWorkComponent {
  @Input() visible: boolean = false;
  @Input() action: number = 0; // 0: Create, 1: Edit
  @Output() closeDialog = new EventEmitter<void>();
  @Output() onWorkReportCreated = new EventEmitter<void>();
  recommendations: string = '';
  observations: string = '';
  development: string = '';
  description: string = '';
  orderWork: OrderWork[] = [];
  selectedOrderWork: OrderWork | null = null;
  filteredOrderWork: any[] | undefined;
  orderWorks: OrderWork[] = [];
  selectedFile!: File;
  previewImage: string | ArrayBuffer | null = null;
  anexos = [
    {
      descripcion: '',
      imagen: null as string | null,
      file: null as File | null,
    },
  ];
  tareas = [
    { titulo: 'Revisión técnica', subdescripciones: [''] },
    { titulo: 'Instalación de software', subdescripciones: [''] },
  ];

  constructor(
    private messageService: MessageService,
    private orderWorkService: OrderWorkService,
    private workReportService: WorkReportService
  ) {}

  createWorkReport() {
    const exhibitUploadPromises = this.anexos.map((anexo) => {
      const formData = new FormData();
      formData.append('tittle', anexo.descripcion);
      if (anexo.file) {
        formData.append('image', anexo.file);
      }

      return this.workReportService.createExhibit(formData).toPromise();
    });

    Promise.all(exhibitUploadPromises)
      .then((responses) => {
        const exhibitIds = responses.map((res: any) => res.id); // suponiendo que cada respuesta contiene { id: number }

        const workReportData = {
          work_order_id: this.selectedOrderWork?.id,
          observations: this.observations,
          recommendations: this.recommendations,
          exhibit_ids: exhibitIds,
        };

        // Crear el certificado de entrega
        console.log('Creando informe de trabajo con datos:', workReportData);
        // this.workReportService.createWorkReport(workReportData).subscribe({
        //   next: (response) => {
        //     this.messageService.add({
        //       severity: 'success',
        //       summary: 'Éxito',
        //       detail: 'Informe de trabajo creado exitosamente.',
        //     });
        //     this.onWorkReportCreated.emit();
        //     this.close();
        //   },
        //   error: (err) => {
        //     this.messageService.add({
        //       severity: 'error',
        //       summary: 'Error',
        //       detail: 'No se pudo crear el informe de trabajo.',
        //     });
        //     console.error('Error al crear el informe de trabajo:', err);
        //   },
        // });
      })
      .catch((err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron subir los anexos.',
        });
        console.error('Error al subir anexos:', err);
      });
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

  filterWorkReport(event: AutoCompleteCompleteEvent) {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.orderWorks.length; i++) {
      let orderWork = this.orderWorks[i];
      if (
        orderWork.quote.code.toLowerCase().indexOf(query.toLowerCase()) == 0
      ) {
        filtered.push(orderWork);
      }
    }

    this.filteredOrderWork = filtered;
  }

  loadOrderWorks() {
    this.orderWorkService.getOrders().subscribe({
      next: (response) => {
        this.orderWorks = response.filter((o: OrderWork) => !!o.end_date); // solo con fecha de cierre
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las órdenes de trabajo.',
        });
      },
    });
  }

  close() {
    this.visible = false;
    this.orderWorks = [];
    this.selectedOrderWork = null;
    this.filteredOrderWork = undefined;
    this.recommendations = '';
    this.observations = '';
    this.anexos = [{ descripcion: '', imagen: null, file: null }];
    this.tareas = [
      { titulo: 'Revisión técnica', subdescripciones: [''] },
      { titulo: 'Instalación de software', subdescripciones: [''] },
    ];
    this.closeDialog.emit();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['visible']) {
      this.loadOrderWorks();
    }
  }

  onImageSelected(event: any, index: number) {
    const file: File = event.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      this.anexos[index].imagen = reader.result as string; // para mostrar vista previa
      this.anexos[index].file = file; // para enviar el archivo real al backend
    };

    reader.readAsDataURL(file);
  }
}
