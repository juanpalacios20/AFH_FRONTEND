import { Component } from '@angular/core';
import { Costs } from '../../../interfaces/models';
import { ButtonModule } from 'primeng/button';
import { MenuComponent } from '../../../shared/ui/menu/menu.component';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { FormsModule } from '@angular/forms';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { NgIf } from '@angular/common';
import { ConfirmationService, MessageService } from 'primeng/api';
import FormCostsComponent from '../form-costs/form-costs.component';
import { LocalStorageService } from '../../../localstorage.service';
import { CookieService } from 'ngx-cookie-service';
import { CostService } from '../../services/costs.service';
import ViewCostsComponent from '../view-costs/view-costs.component';

@Component({
  selector: 'app-management-costs',
  imports: [
    ButtonModule,
    MenuComponent,
    InputIconModule,
    IconFieldModule,
    InputTextModule,
    FloatLabelModule,
    FormsModule,
    ConfirmDialog,
    ToastModule,
    TableModule,
    TagModule,
    NgIf,
    FormCostsComponent,
    ViewCostsComponent,
  ],
  templateUrl: './management-costs.component.html',
  styleUrl: './management-costs.component.css',
  providers: [ConfirmationService, MessageService],
})
export default class ManagementCostsComponent {
  createVisible: boolean = false;
  editVisible: boolean = false;
  viewVisible: boolean = false;
  costs: Costs[] = [];
  costToEdit: Costs | undefined;
  costToView: Costs | undefined;
  costToSearch: string = '';
  loadingCost: boolean = false;

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private localStorageService: LocalStorageService,
    private cookieService: CookieService,
    private costService: CostService
  ) {
    this.loadData();
  }

  loadData() {
    this.loadingCost = true;
    const costsLS: any[] | null = this.localStorageService.getItem('costs');
    if (costsLS !== null) {
      this.costs = costsLS;
      return;
    }
    this.costService.getCosts().subscribe({
      next: (response) => {
        this.costs = response;
        this.localStorageService.setItem('costs', this.costs);
        this.loadingCost = false;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las herramientas en mantenimiento',
        });
        this.loadingCost = false;
      },
    });
    console.log('los fackin costos', this.costs);
  }

  showCreateNewCost() {
    this.createVisible = true;
  }
  closeCreateNewCost() {
    this.loadData();
    this.createVisible = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Costo creada exitosamente.',
    });
  }
  openView(cost: Costs) {
    this.costToView = cost;
    this.viewVisible = true;
  }
  showEditDialog(cost: Costs) {
    this.costToEdit = cost;
    this.editVisible = true;
  }
  closeEditNewCost() {
    this.loadData();
    this.editVisible = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Costo editada exitosamente.',
    });
  }
  balance(cost: string, quote: string): string {
    let cleanCost = cost.replace(/\$/g, '').replace(/\./g, '');
    let cleanQuote = quote.replace(/\$/g, '').replace(/\./g, '');

    let result = Number(cleanQuote) - Number(cleanCost);

    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(result);
  }
}
