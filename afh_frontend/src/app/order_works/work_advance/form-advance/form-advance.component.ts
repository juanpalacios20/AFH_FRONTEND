import { Component } from '@angular/core';
import { MenuComponent } from '../../../shared/ui/menu/menu.component';
import { ButtonModule } from 'primeng/button';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { exhibit, WorkAdvance, WorkProgress } from '../../../interfaces/models';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { WorkReportService } from '../../../work_report/services/work_report.service';
import { forkJoin, switchMap } from 'rxjs';
import { workAdvanceService } from '../../services/work_advance.service';
import { progressOrderService } from '../../services/progress_work.service';
import { FileUpload } from 'primeng/fileupload';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { LocalStorageService } from '../../../localstorage.service';
import { GlobalService } from '../../../global.service';
import { InputNumber } from 'primeng/inputnumber';
import { ConfirmDialog } from 'primeng/confirmdialog';

@Component({
  selector: 'app-form-advance',
  imports: [
    ButtonModule,
    RouterModule,
    InputTextModule,
    FormsModule,
    NgFor,
    FileUpload,
    NgIf,
    TextareaModule,
    CommonModule,
    ToastModule,
    FormsModule,
    InputNumber,
    ConfirmDialog,
  ],
  templateUrl: './form-advance.component.html',
  styleUrl: './form-advance.component.css',
  providers: [ConfirmationService, MessageService],
})
export class FormAdvanceComponent {
  orderCode: string = '';
  advanceDescription: string = '';
  percent: number | null = null;
  exhibits = [
    {
      id: 0,
      tittle: '',
      images: [] as string[],
      files: [] as File[],
    },
  ];
  imagenesEliminadas: { [key: number]: string[] } = {};
  progressOrderId: number = 0;
  loading: boolean = false;
  titleAction: string = '';
  advanceToEdit: WorkAdvance | undefined = undefined;
  progressToEdit: WorkProgress | null = null;
  anexosEliminados: number[] = [];
  disabled: boolean = false;
  disabledPercent: boolean = false;
  errorMessage: string = '';
  invalidPercentMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workReportService: WorkReportService,
    private workAdvanceService: workAdvanceService,
    private workProgressOrderService: progressOrderService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private localStorageService: LocalStorageService,
    private globalService: GlobalService
  ) {
    this.progressOrderId = Number(this.route.snapshot.paramMap.get('id'));
    this.action();
    this.globalService.changeTitle('AFH: Avances');
  }

  verify() {
    this.errorMessage = '';
    this.invalidPercentMessage = '';
    const message = 'Campo requerido';
    if (
      this.advanceDescription === '' ||
      this.percent === null ||
      this.percent === 0
    ) {
      this.errorMessage = message;
    }
    for (let i = 0; i < this.exhibits.length; i++) {
      if (this.exhibits[i].tittle === '') {
        this.errorMessage = message;
      }
      if (this.exhibits[i].images.length === 0) {
        this.errorMessage = message;
      }
    }
    if (
      !localStorage.getItem('edit') &&
      this.progressToEdit?.progress_percentage &&
      this.percent &&
      this.percent < this.progressToEdit.progress_percentage
    ) {
      this.invalidPercentMessage =
        'El porcentaje debe ser mayor al porcentaje del trabajo actual' +
        ' ' +
        this.progressToEdit.progress_percentage;
    }
  }

  action() {
    this.progressToEdit =
      this.localStorageService.getItem<WorkProgress>('progress');
    this.orderCode = this.progressToEdit?.work_order?.quote?.code ?? '';
    const completed = localStorage.getItem('completed');
    if (completed === 'true') {
      this.disabled = true;
    }
    if (localStorage.getItem('edit') === 'true') {
      let editPercent = localStorage.getItem('editPercent');
      if (editPercent === 'true') {
        this.disabledPercent = true;
      }
      this.titleAction = 'Editar avance';
      const count = localStorage.getItem('count');
      this.advanceToEdit = this.progressToEdit?.work_advance[Number(count)];
      if (this.advanceToEdit) {
        this.advanceDescription = this.advanceToEdit.description;
        this.percent = this.progressToEdit?.progress_percentage ?? null;
        this.exhibits = this.advanceToEdit.exhibits.map((exhibit) => ({
          id: exhibit.id,
          tittle: exhibit.tittle,
          images: exhibit.images,
          files: [],
        }));
      }
    } else {
      this.titleAction = 'Crear avance';
    }
  }

  submit() {
    this.verify();
    if (this.errorMessage !== '' || this.invalidPercentMessage !== '') {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: `Todos los campos son requeridos`,
      });
      return;
    }
    if (localStorage.getItem('edit') === 'true') {
      if (this.percent) {
        this.confirmationChangePercent();
      } else {
        this.updateWorkAdvance();
      }
    } else {
      this.createAdvance();
    }
  }

  updateWorkAdvance() {
    const original = this.advanceToEdit;
    const current = this.exhibits;
    const advanceId = original?.id || 0;
    if (!advanceId) return;

    this.loading = true;

    //logia para cambiar el porcentaje
    let dataPercent: any = {};
    if (this.percent) {
      dataPercent.percentage = this.percent;
    }
    if (dataPercent !== null && this.progressToEdit?.id) {
      this.workProgressOrderService
        .changePercentage(this.progressToEdit.id, dataPercent)
        .subscribe({
          next: (response) => {},
          error: (err) => {
          },
        });
    }
    // 🟡 Inicializa la variable de anexos eliminados
    this.anexosEliminados = this.anexosEliminados || [];

    // 🟠 Clonamos los current IDs (sólo anexos con ID válido)
    const currentIds: number[] = current
      .filter((anexo) => anexo.id !== 0)
      .map((anexo) => anexo.id);

    // 🔵 Preparar promesas para crear o actualizar anexos
    const exhibitUpdatePromises = current.map((anexo, anexoIndex) => {
      const hasTitle = anexo.tittle?.trim() !== '';
      const hasFiles =
        (anexo.files && anexo.files.length > 0) ||
        (anexo.images && anexo.images.length > 0);

      if (!hasTitle && !hasFiles) return Promise.resolve(null);

      const formData = new FormData();
      if (hasTitle) {
        formData.append(anexo.id === 0 ? 'tittle' : 'title', anexo.tittle);
      }

      const urlFetches = (anexo.images || [])
        .filter((url) => !this.imagenesEliminadas?.[anexo.id]?.includes(url))
        .map((url, index) =>
          fetch(url)
            .then((res) => res.blob())
            .then((blob) => ({
              blob,
              filename: `old_image_${anexoIndex}_${index}.jpg`,
            }))
        );
      return Promise.all(urlFetches).then((blobs) => {
        if (anexo.id !== 0) {
          blobs.forEach(({ blob, filename }) => {
            formData.append('image', blob, filename);
          });
        }

        if (anexo.id === 0) {
          (anexo.files || []).forEach((file: File) => {
            formData.append('images', file);
          });

          // Crear nuevo anexo
          return this.workReportService
            .createExhibit(formData)
            .toPromise()
            .then((res) => res.exhibit_id);
        } else {
          // Actualizar anexo existente
          return this.workReportService
            .updateExhibit(formData, anexo.id)
            .toPromise()
            .then(() => anexo.id);
        }
      });
    });

    // 🟢 Procesar todos los cambios
    Promise.all([...exhibitUpdatePromises])
      .then((results) => {
        const createdOrUpdatedIds = results.filter(
          (id) => id !== null
        ) as number[];
        const finalExhibitIds = [
          ...currentIds.filter((id) => !this.anexosEliminados.includes(id)), // actuales no eliminados
          ...createdOrUpdatedIds.filter((id) => !currentIds.includes(id)), // nuevos anexos
        ];

        // Preparamos los datos finales para el avance
        const data: any = {};
        const originalIds = original?.exhibits.map((e) => e.id).sort() || [];
        const newSortedIds = [...finalExhibitIds].sort();

        const idsSonIguales =
          originalIds.length === newSortedIds.length &&
          originalIds.every((id, i) => id === newSortedIds[i]);

        if (this.advanceDescription !== original?.description) {
          data.description = this.advanceDescription;
        }

        if (!idsSonIguales) {
          data.exhibits_ids = finalExhibitIds;
        }

        if (Object.keys(data).length === 0) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `Sin cambios para actualizar`,
          });
          return;
        }

        return this.workAdvanceService
          .updateWorkAdvance(data, advanceId)
          .toPromise();
      })
      .then(() => {
        this.localStorageService.removeItem('progressOrders');
        localStorage.setItem('state', 'true');
        this.router.navigate(['/progressOrder/info/', this.progressToEdit?.id]);
      })
      .catch((err) => {
        console.error('Error durante la actualización del avance:', err);
      })
      .finally(() => {
        this.loading = false;
      });
  }

  createAdvance() {
    this.loading = true;
    const exhibitRequests = this.exhibits.map((anexo) => {
      const formData = new FormData();
      formData.append('tittle', anexo.tittle);
      anexo.files.forEach((file) => formData.append('images', file));
      return this.workReportService.createExhibit(formData);
    });
    forkJoin(exhibitRequests)
      .pipe(
        switchMap((exhibitResponses: any[]) => {
          const exhibit_ids = exhibitResponses.map((res) => res.exhibit_id);
          const workAdvanceData = {
            description: this.advanceDescription,
            exhibits_ids: exhibit_ids,
            date: new Date().toISOString().split('T')[0],
          };
          return this.workAdvanceService.createWorkAdvance(workAdvanceData);
        }),
        switchMap((workAdvanceResponse: any) => {
          const workAdvanceId = workAdvanceResponse.id;
          const progressId = this.progressOrderId;

          return this.workProgressOrderService.advanceToProgress(
            workAdvanceId,
            progressId
          );
        })
      )
      .subscribe({
        next: (response) => {
          if (this.progressToEdit) {
            const data = {
              percentage: this.percent,
            };
            this.workProgressOrderService
              .changePercentage(this.progressToEdit?.id, data)
              .subscribe({
                next: (response) => {
                },
                error: (err) => {
                },
              });
          }
          this.localStorageService.removeItem('progressOrders');
          this.loading = true;
          localStorage.setItem('state', 'true');
          this.router.navigate(['/progressOrder/info/', this.progressOrderId]);
        },
        error: (err) => {
          console.error(
            'Error durante la creación del informe de trabajo:',
            err
          );
        },
      });
  }

  close() {
    localStorage.removeItem('edit');
    localStorage.removeItem('editPercent');
    this.advanceDescription = '';
    this.exhibits = [
      {
        id: 0,
        tittle: '',
        images: [] as string[],
        files: [] as File[],
      },
    ];
  }

  resetForm() {
    this.advanceDescription = '';
    this.percent = null;
    this.exhibits = [
      {
        id: 0,
        tittle: '',
        images: [] as string[],
        files: [] as File[],
      },
    ];
    this.imagenesEliminadas = {};
  }

  addExhibit() {
    this.exhibits.push({
      id: 0,
      tittle: '',
      images: [] as string[],
      files: [] as File[],
    });
  }

  onImagesSelected(event: any, index: number) {
    const selectedFiles = Array.from(event.files) as File[];
    this.exhibits[index].files.push(...selectedFiles);
    selectedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.exhibits[index].images.push(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  }

  deleteExhibit(index: number) {
    this.exhibits.splice(index, 1);
  }

  addImage(index: number) {
    this.exhibits[index].images.push('');
  }

  removeImage(anexoIndex: number, imgUrl: string) {
    const anexo = this.exhibits[anexoIndex];
    anexo.images = anexo.images.filter((img: string) => img !== imgUrl);

    if (anexo.id !== 0) {
      if (!this.imagenesEliminadas[anexo.id]) {
        this.imagenesEliminadas[anexo.id] = [];
      }
      this.imagenesEliminadas[anexo.id].push(imgUrl);
    }
  }

  confirmationChangePercent() {
    this.confirmationService.confirm({
      message:
        'Se detectan cambios en el porcentaje ¿Está seguro que desea continuar?',
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
        this.updateWorkAdvance();
      },
    });
  }
}
