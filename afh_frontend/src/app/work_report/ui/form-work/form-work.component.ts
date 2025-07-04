import { CommonModule, NgIf } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import {
  AutoComplete,
  AutoCompleteCompleteEvent,
  AutoCompleteModule,
} from 'primeng/autocomplete';
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
import { OrderWork, WorkReport } from '../../../interfaces/models';
import { forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { QuoteService } from '../../../quotes_works/services/quote.service';
import { ConfirmDialog } from 'primeng/confirmdialog';

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
  ],
  templateUrl: './form-work.component.html',
  styleUrl: './form-work.component.css',
  providers: [MessageService, AutoCompleteModule],
})
export default class FormWorkComponent {
  @Input() visible: boolean = false;
  @Input() action: number = 0; // 0: Create, 1: Edit
  @Input() workReportToEdit: WorkReport | null = null;
  @Output() closeDialog = new EventEmitter<void>();
  @Output() onWorkReportCreated = new EventEmitter<void>();
  actionTittle: string = '';
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
  imagenesEliminadas: { [key: number]: string[] } = {};
  anexosEliminados: number[] = [];
  loading: boolean = false;
  anexos = [
    {
      id: 0,
      descripcion: '',
      imagenes: [] as string[],
      files: [] as File[],
    },
  ];

  errorMessage: string = '';
  errorOrderInvalidMessage: String = '';

  constructor(
    private messageService: MessageService,
    private orderWorkService: OrderWorkService,
    private workReportService: WorkReportService,
    private quoteService: QuoteService,
    private confirmationService: ConfirmationService
  ) {}

  trackByIndex(index: number, obj: any): any {
    return index;
  }

  verify() {
    this.errorMessage = '';
    if (
      this.description === '' ||
      this.development === '' ||
      this.recommendations === '' ||
      this.observations === '' ||
      this.selectedOrderWork === null
    ) {
      this.errorMessage = 'Campo requerido';
      console.log('error otros datos');
    }
    for (let i = 0; i < this.anexos.length; i++) {
      if (
        this.anexos[i].descripcion === '' ||
        this.anexos[i].imagenes.length === 0
      ) {
        if (this.anexos[i].files.length === 0 && this.action === 0) {
          this.errorMessage = 'Campo requerido';
        }

        if (this.action === 1) {
          this.errorMessage = 'Campo requerido';
        }
      }
    }
    if (
      this.selectedOrderWork &&
      typeof this.selectedOrderWork === 'string' &&
      typeof (this.selectedOrderWork as string).trim === 'function'
    ) {
      const manualCode = (this.selectedOrderWork as string).trim();
      const match = this.filteredOrderWork?.find((q) => q.quote.code === manualCode);
      if (match) {
        this.selectedOrderWork = match;
      } else {
        this.errorOrderInvalidMessage =
          'Este cotización no tiene una orden o ya tiene un acta en curso';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Por favor seleccione una cotización válida del listado.',
        });
        return;
      }
    }
  }

  createWorkReport() {
  this.loading = true;

  const exhibitRequests = this.anexos.map((anexo) => {
    const formData = new FormData();
    formData.append('tittle', anexo.descripcion);
    anexo.files.forEach((file) => formData.append('images', file));
    return this.workReportService.createExhibit(formData);
  });

  forkJoin(exhibitRequests)
    .pipe(
      switchMap((exhibitResponses: any[]) => {
        const exhibit_ids = exhibitResponses.map((res) => res.exhibit_id);

        // Validación si el usuario ingresó el código manualmente
        if (
          this.selectedOrderWork &&
          typeof this.selectedOrderWork === 'string' &&
          typeof (this.selectedOrderWork as string).trim === 'function'
        ) {
          const manualCode = (this.selectedOrderWork as string).trim();
          const match = this.filteredOrderWork?.find(
            (q) => q.code === manualCode
          );
          if (match) {
            this.selectedOrderWork = match;
          }
        }

        const workReportData = {
          work_order_id: this.selectedOrderWork?.id,
          observations: this.observations,
          recommendations: this.recommendations,
          exhibit_ids: exhibit_ids,
          development: this.development,
          description: this.description,
        };

        return this.workReportService.createWorkReport(workReportData);
      })
    )
    .subscribe({
      next: () => {
        this.loading = false;
        this.closeDialog.emit();
        this.onWorkReportCreated.emit();
        this.close();
      },
      error: (err) => {
        console.error('Error durante la creación del informe de trabajo:', err);
        this.loading = false;
      },
    });
}

  updateWorkReport() {
    this.loading = true;
    const data: any = {};
    const reportId = this.workReportToEdit?.id || 0;

    // 1. Verificar campos que cambiaron
    if (this.observations !== this.workReportToEdit?.observations) {
      data.observations = this.observations;
    }
    if (this.description !== this.workReportToEdit?.description) {
      data.description = this.description;
    }
    if (this.development !== this.workReportToEdit?.development) {
      data.development = this.development;
    }
    if (this.recommendations !== this.workReportToEdit?.recommendations) {
      data.recommendations = this.recommendations;
    }

    // 2. Actualizar acta si hay cambios
    if (Object.keys(data).length > 0) {
      this.workReportService.updateWorkReport(data, reportId).subscribe({
        next: () => console.log(''),
        error: (err) => console.error('Error al actualizar el acta:', err),
      });
    }

    // 3. Procesar anexos
    this.anexos.forEach((anexo, anexoIndex) => {
      const hasTitle = anexo.descripcion?.trim() !== '';
      const hasFiles =
        (anexo.files && anexo.files.length > 0) ||
        (anexo.imagenes && anexo.imagenes.length > 0);

      if (!hasTitle && !hasFiles) return; // Nada que enviar

      const formData = new FormData();

      if (hasTitle && anexo.id === 0)
        formData.append('tittle', anexo.descripcion);
      if (hasTitle && anexo.id !== 0)
        formData.append('title', anexo.descripcion);

      // Convertir URLs de imágenes previas a blobs
      const urlFetches = (anexo.imagenes || [])
        .filter((url) => !this.imagenesEliminadas[anexo.id]?.includes(url))
        .map((url, index) =>
          fetch(url)
            .then((res) => res.blob())
            .then((blob) => ({
              blob,
              filename: `old_image_${anexoIndex}_${index}.jpg`,
            }))
        );

      Promise.all(urlFetches)
        .then((blobs) => {
          // Agregar imágenes previas (solo si se actualiza)
          blobs.forEach(({ blob, filename }) => {
            // Solo para actualizar
            if (anexo.id !== 0) formData.append('image', blob, filename);
          });

          // Agregar nuevas imágenes
          (anexo.files || []).forEach((file: File) => {
            // Para ambos casos
            if (anexo.id === 0) {
              formData.append('images', file);
            }
          });

          // 4. Actualizar o crear anexo
          if (anexo.id !== 0) {
            this.workReportService.updateExhibit(formData, anexo.id).subscribe({
              next: (res) => console.log(''),
              error: (err) => console.error('Error al actualizar anexo:', err),
            });
          } else {
            this.workReportService.createExhibit(formData).subscribe({
              next: (res) => {
                const exhibitId = res.exhibit_id;
                this.workReportService
                  .addExhibitToWorkReport(reportId, exhibitId)
                  .subscribe({
                    next: (res) =>
                      console.log(''),
                    error: (err) =>
                      console.error('Error al asociar anexo:', err),
                  });
              },
              error: (err) => console.error('Error al crear nuevo anexo:', err),
            });
          }
        })
        .catch((err) =>
          console.error('Error procesando imágenes previas:', err)
        );
    });
    // 5. Eliminar anexos completos
    this.anexosEliminados.forEach((anexoId) => {
      this.workReportService.deleteExhibit(anexoId).subscribe({
        next: () => console.log(''),
        error: (err) =>
          console.error(`Error al eliminar anexo ${anexoId}:`, err),
      });
    });

    setTimeout(() => {
      this.closeDialog.emit();
      this.onWorkReportCreated.emit();
      this.close();
      this.loading = false;
    }, 5000);
  }

  onSubmit() {
    this.errorMessage = '';
    this.verify();
    if (this.errorMessage !== '') {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Todos los campos son requeridos',
      });
      return;
    }
    if (this.action === 0) {
      this.createWorkReport();
    }
    if (this.action === 1 && this.workReportToEdit) {
      this.updateWorkReport();
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
    this.workReportService.getQuotesWithoutReport().subscribe({
      next: (response) => {
        this.orderWorks = response;
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

  resetForm() {
    this.errorMessage = '';
    this.errorOrderInvalidMessage = '';
    this.orderWorks = [];
    this.selectedOrderWork = null;
    this.filteredOrderWork = undefined;
    this.recommendations = '';
    this.observations = '';
    this.development = '';
    this.description = '';
    this.anexos = [{ id: 0, descripcion: '', imagenes: [], files: [] }];
    this.visible = false;
  }

  close() {
    this.resetForm();
    this.closeDialog.emit();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['visible']) {
      this.loadOrderWorks();
      if (this.action === 0) {
        this.actionTittle = 'generar acta de entrega';
      }
      if (this.action === 1) {
        this.actionTittle = 'editar acta de entrega';
      }
    }
    if (this.workReportToEdit && this.action === 1) {
      this.description = this.workReportToEdit.description;
      this.development = this.workReportToEdit.development;
      this.recommendations = this.workReportToEdit.recommendations;
      this.observations = this.workReportToEdit.observations;
      this.selectedOrderWork = this.workReportToEdit.work_order;
      this.anexos = this.workReportToEdit.exhibit.map((ex) => ({
        id: ex.id,
        descripcion: ex.tittle,
        imagenes: ex.images,
        files: [],
      }));
    }
  }

  onImageSelected(event: any, index: number) {
    const file: File = event.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      this.anexos[index].imagenes.push(reader.result as string);
      this.anexos[index].files.push(file);
    };

    reader.readAsDataURL(file);
  }

  onImagesSelected(event: any, index: number) {
    const selectedFiles = Array.from(event.files) as File[];
    this.anexos[index].files.push(...selectedFiles);
    selectedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.anexos[index].imagenes.push(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  }

  removeAnexo(index: number) {
    const anexo = this.anexos[index];
    if (anexo.id !== 0) {
      this.anexosEliminados.push(anexo.id);
    }
    this.anexos.splice(index, 1);
  }

  removeImage(anexoIndex: number, imgUrl: string) {
    const anexo = this.anexos[anexoIndex];
    anexo.imagenes = anexo.imagenes.filter((img: string) => img !== imgUrl);

    if (anexo.id !== 0) {
      if (!this.imagenesEliminadas[anexo.id]) {
        this.imagenesEliminadas[anexo.id] = [];
      }
      this.imagenesEliminadas[anexo.id].push(imgUrl);
    }
  }

  confirmationClose() {
    this.confirmationService.confirm({
      message:
        '¿Está seguro que desea cerrar el formulario? Los cambios se perderán',
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
        this.close();
      },
    });
  }
}
