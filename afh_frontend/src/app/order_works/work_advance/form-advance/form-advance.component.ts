import { Component } from '@angular/core';
import { MenuComponent } from '../../../shared/ui/menu/menu.component';
import { ButtonModule } from 'primeng/button';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { exhibit } from '../../../interfaces/models';
import { NgFor } from '@angular/common';
import { WorkReportService } from '../../../work_report/services/work_report.service';
import { forkJoin, switchMap } from 'rxjs';
import { workAdvanceService } from '../../services/work_advance.service';
import { progressOrderService } from '../../services/progress_work.service';
import { FileUpload } from 'primeng/fileupload';

@Component({
  selector: 'app-form-advance',
  imports: [
    ButtonModule,
    RouterModule,
    InputTextModule,
    FormsModule,
    NgFor,
    FileUpload,
  ],
  templateUrl: './form-advance.component.html',
  styleUrl: './form-advance.component.css',
})
export class FormAdvanceComponent {
  orderCode: string = localStorage.getItem('code') ?? '';
  advanceDescription: string = '';
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workReportService: WorkReportService,
    private workAdvanceService: workAdvanceService,
    private workProgressOrderService: progressOrderService
  ) {
    this.progressOrderId = Number(this.route.snapshot.paramMap.get('id'));
  }

  createAdvance() {
    this.loading = true;
    // 1. Crear una lista de peticiones para los exhibits
    const exhibitRequests = this.exhibits.map((anexo) => {
      const formData = new FormData();
      formData.append('tittle', anexo.tittle);
      anexo.files.forEach((file) => formData.append('images', file));
      return this.workReportService.createExhibit(formData); // Devuelve Observable
    });

    // 2. Ejecutar todas las peticiones de exhibits en paralelo
    forkJoin(exhibitRequests)
      .pipe(
        // 3. Cuando todas terminen, crear el avance con los IDs devueltos
        switchMap((exhibitResponses: any[]) => {
          const exhibit_ids = exhibitResponses.map((res) => res.exhibit_id);
          console.log('ids', exhibit_ids);
          const workAdvanceData = {
            description: this.advanceDescription,
            exhibits_ids: exhibit_ids,
            date: new Date().toISOString().split('T')[0],
          };
          console.log('workAdvanceData', workAdvanceData);
          // Crear el avance y devolver su observable
          return this.workAdvanceService.createWorkAdvance(workAdvanceData);
        }),

        // 4. Luego, asignar el avance al progreso
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
          console.log('Avance creado y asignado al progreso:', response);
          this.loading = true;
          localStorage.setItem('state', 'true');
          this.router.navigate(['/progressOrder/info/', this.progressOrderId]);

          // Puedes mostrar notificación, redireccionar, limpiar el formulario, etc.
        },
        error: (err) => {
          console.error(
            'Error durante la creación del informe de trabajo:',
            err
          );
        },
      });
  }

  resetForm() {
    this.advanceDescription = '';
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
}
