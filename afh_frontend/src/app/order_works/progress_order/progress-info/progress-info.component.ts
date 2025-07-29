import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { workProgressOrder } from '../../../interfaces/models';
import { ButtonModule } from 'primeng/button';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FormsModule } from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterModule,
} from '@angular/router';
import { progressOrderService } from '../../services/progress_work.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { workAdvanceService } from '../../services/work_advance.service';
import { Tooltip } from 'primeng/tooltip';
import { ConfirmDialog } from 'primeng/confirmdialog';

@Component({
  selector: 'app-progress-info',
  imports: [
    NgIf,
    ButtonModule,
    AutoCompleteModule,
    FormsModule,
    RouterModule,
    NgFor,
    NgIf,
    ToastModule,
    Tooltip,
    ConfirmDialog,
  ],
  templateUrl: './progress-info.component.html',
  styleUrl: './progress-info.component.css',
  providers: [MessageService, ConfirmationService],
})
export default class ProgressInfoComponent implements OnInit {
  workProgressOrder: workProgressOrder | null = null;
  filteredStates: string[] = [];
  selectedStates: string = '';
  statesOption = ['En progreso'];
  idToEdit: number | null = null;
  progressAdvance: workProgressOrder | null = null;

  constructor(
    private route: ActivatedRoute,
    private workProgressOrderService: progressOrderService,
    private workAdvanceService: workAdvanceService,
    private messageService: MessageService,
    private router: Router,
    private confirmationService: ConfirmationService
  ) {
    this.progressAdvance =
      workAdvanceService.getItem<workProgressOrder>('progress');
    console.log(this.progressAdvance);
    if (localStorage.getItem('edit') === 'true') {
      console.log('editado');
    }
  }

  ngOnInit(): void {
    console.log(this.progressAdvance?.state);
    if (Number(this.progressAdvance?.state) === 3) {
      localStorage.setItem('completed', 'true');
    }
    if (Number(this.progressAdvance?.state) === 2) {
      this.statesOption = ['Completado'];
    }
    const state = localStorage.getItem('state');
    const edit = localStorage.getItem('edit');
    if (state === 'true' && edit === 'true') {
      console.log('avance editado');
      localStorage.removeItem('state');
      localStorage.removeItem('edit');
      this.getProgress();
      setTimeout(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Avance editado exitosamente',
        });
      }, 0);
    }
    if (state === 'true' && edit !== 'true') {
      console.log('avance creado');
      localStorage.removeItem('state');
      this.getProgress();
      setTimeout(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Avance creado exitosamente',
        });
      }, 0);
    }
  }

  getProgress() {
    const id = this.route.snapshot.paramMap.get('id');
    this.workProgressOrderService.getProgressById(Number(id) || 0).subscribe({
      next: (response) => {
        localStorage.removeItem('edit');
        this.workProgressOrder = response;
        this.workAdvanceService.setItem('progress', this.workProgressOrder);
        console.log('actualizando informacion');
        this.progressAdvance =
          this.workAdvanceService.getItem<workProgressOrder>('progress');
        console.log(this.workProgressOrder);
      },
      error: (error) => {
        console.error('Error fetching progress order:', error);
      },
    });
  }

  submitChangeState() {
    if (this.selectedStates === 'En progreso') {
      this.changeState();
    }
    if (this.selectedStates === 'Completado') {
      this.confirm();
    }
  }

  changeState() {
    if (this.progressAdvance) {
      let data: any = {};
      console.log(this.selectedStates);
      if (this.selectedStates === 'En progreso') {
        data = {
          status: 2,
        };
        this.statesOption = ['Completado'];
      }
      if (this.selectedStates === 'Completado') {
        if (this.progressAdvance?.work_advance.length === 0) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `No puede completar el progreso de una orden sin al menos un avance`,
          });
          return;
        }
        localStorage.setItem('completed', 'true');
        data = {
          status: 3,
        };
      }
      console.log(data);
      this.workProgressOrderService
        .changeState(this.progressAdvance.id, data)
        .subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Estado actualizado',
              detail: `El estado ha sido cambiado a ${this.selectedStates}`,
            });
            this.selectedStates = '';
            console.log(response);
            this.getProgress();
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: `Ha ocurrido un error, intentelo más tarde`,
            });
            console.log(err);
          },
        });
    }
  }

  getStateString(state: string | undefined): string {
    switch (Number(state)) {
      case 1:
        return 'Pendiente';
      case 2:
        return 'En Progreso';
      case 3:
        return 'Completado';
      default:
        return 'Desconocido';
    }
  }

  toEdit(id: number, count: number) {
    if (id === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Ha ocurrido un error, intentelo más tarde',
      });
    }
    this.idToEdit = id;
    localStorage.setItem('edit', 'true');
    localStorage.setItem('count', count.toString());
    this.router.navigate(['/progressOrder/info/create', id]);
  }

  close() {
    localStorage.removeItem('code');
    localStorage.removeItem('completed');
    localStorage.removeItem('count');
    this.workAdvanceService.removeItem('progress');
  }

  confirm() {
    this.confirmationService.confirm({
      message: '¿Está seguro que desea marcar la orden como completada?',
      header: 'Confirmacion',
      closable: true,
      closeOnEscape: true,
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Aceptar',
      },
      accept: () => {
        this.changeState();
      },
    });
  }

  filterStates(event: any) {
    const query = event.query.toLowerCase();
    this.filteredStates = this.statesOption.filter((option) =>
      option.toLowerCase().includes(query)
    );
  }

  blockTyping(event: KeyboardEvent) {
    event.preventDefault();
  }

  uploadCode() {
    localStorage.setItem(
      'code',
      this.workProgressOrder?.id
        ? this.workProgressOrder.work_order.quote.code
        : ''
    );
  }
}
