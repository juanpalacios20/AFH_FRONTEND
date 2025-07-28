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
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { workAdvanceService } from '../../services/work_advance.service';

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
  ],
  templateUrl: './progress-info.component.html',
  styleUrl: './progress-info.component.css',
  providers: [MessageService],
})
export default class ProgressInfoComponent implements OnInit {
  workProgressOrder: workProgressOrder | null = null;
  filteredStates: string[] = [];
  selectedStates: string = '';
  statesOption = ['En progreso', 'Completado'];
  idToEdit: number | null = null;
  progressAdvance: workProgressOrder | null = null;

  constructor(
    private route: ActivatedRoute,
    private workProgressOrderService: progressOrderService,
    private workAdvanceService: workAdvanceService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.progressAdvance =
      workAdvanceService.getItem<workProgressOrder>('progress');
    console.log(this.progressAdvance);
    if (localStorage.getItem('edit') === 'true') {
      console.log('editado');
    }
  }

  ngOnInit(): void {
    const state = localStorage.getItem('state');
    const edit = localStorage.getItem('edit');
    console.log(state);
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

  changeState() {
    if (this.progressAdvance) {
      let data: any = {};
      console.log(this.selectedStates);
      if (this.selectedStates === 'En progreso') {
        data = {
          status: 2,
        };
      }
      if (this.selectedStates === 'Completado') {
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
            this.getProgress(); // Refresh the progress order after state change
          },
          error: (err) => {
            this.messageService.add({
              severity: 'danger',
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
