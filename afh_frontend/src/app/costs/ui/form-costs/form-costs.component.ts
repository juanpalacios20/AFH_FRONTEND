import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoComplete, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { Costs, Item, OrderWork } from '../../../interfaces/models';
import { InputNumber } from 'primeng/inputnumber';
import { ConfirmationService, MessageService } from 'primeng/api';
import { WorkReportService } from '../../../work_report/services/work_report.service';
import { CostService } from '../../services/costs.service';
import { LocalStorageService } from '../../../localstorage.service';
import { QuoteService } from '../../../quotes_works/services/quote.service';
import { forkJoin, switchMap } from 'rxjs';

@Component({
  selector: 'app-form-costs',
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
    InputNumber,
  ],
  templateUrl: './form-costs.component.html',
  styleUrl: './form-costs.component.css',
  providers: [MessageService, ConfirmationService],
})
export default class FormCostsComponent {
  @Input() visible: boolean = false;
  @Input() action: number = 0;
  @Input() costToEdit: Costs | undefined;
  @Output() closeDialog = new EventEmitter<void>();
  @Output() handleCreated = new EventEmitter<void>();
  itemsPorOpcion: {
    optionId: number;
    name: string;
    items: Item[];
  } = {
    optionId: 0,
    name: '',
    items: [
      {
        id: 0,
        description: '',
        units: '',
        total_value: 0,
        amount: 0,
        unit_value: 0,
      },
    ],
  };
  validOrder: boolean = false;
  selectedOrderWork: OrderWork | null = null;
  actionTittle: string = '';
  filteredOrder: any[] | undefined;
  filteredOrderWork: any[] | undefined;
  orderWorks: OrderWork[] = [];
  errorMessage: string = '';
  errorOrderInvalidMessage: string = '';
  filteredUnits: string[] = [];
  totalPrice: number = 0;
  itemsToDelete: number[] = [];
  itemsDelete: number = 0;
  itemsAdd: number = 0;
  loadingCreate: boolean = false;
  units: string[] = [
    'Metros',
    'Centímetros',
    'Milímetros',
    'Kilómetros',
    'Pulgadas',
    'Metros cuadrados (m2)',
    'Centímetros cuadrados (cm2)',
    'Metros cubicos (m3)',
    'Centímetros (cm3)',
    'Metro Lineal (ml)',
    'Pies',
    'Kilogramos',
    'Gramos',
    'Miligramos',
    'Libras',
    'Toneladas',
    'Litros',
    'Mililitros',
    'Galones',
    'Unidades',
    'Docenas',
    'Cajas',
    'Pares',
    'Otro',
  ];

  constructor(
    private messageService: MessageService,
    private workReportService: WorkReportService,
    private confirmationService: ConfirmationService,
    private costService: CostService,
    private localStorageService: LocalStorageService,
    private quoteService: QuoteService
  ) {}

  resetForm() {
    this.visible = false;
    this.validOrder = false;
    this.selectedOrderWork = null;
    this.errorMessage = '';
    this.itemsPorOpcion = {
      optionId: 0,
      name: '',
      items: [
        {
          id: 0,
          description: '',
          units: '',
          total_value: 0,
          amount: 0,
          unit_value: 0,
        },
      ],
    };
  }

  close() {
    this.resetForm();
    this.closeDialog.emit();
  }

  verify() {
    this.errorMessage = '';
    for (let j = 0; j < this.itemsPorOpcion.items.length; j++) {
      if (
        (this.itemsPorOpcion.items[j].description === '' ||
          this.itemsPorOpcion.items[j].amount === 0,
        this.itemsPorOpcion.items[j].unit_value === 0,
        this.itemsPorOpcion.items[j].units === '')
      ) {
        this.errorMessage = 'Campo obligatorio';
      }
    }
  }

  submit() {
    if (this.action === 0) {
      this.createCost();
    }
    if (this.action === 1) {
      this.editCost();
    }
  }

  createCost() {
    this.loadingCreate = true;
    this.verify();

    if (this.errorMessage !== '') {
      this.loadingCreate = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Todos los campos son requeridos',
      });
      return;
    }

    // Crear ítems primero
    const itemRequests = this.itemsPorOpcion.items.map((item) => {
      let unitValue = this.getUnitValue(item.units);
      const itemData = {
        description: item.description,
        units: unitValue,
        amount: item.amount,
        unit_value: item.unit_value,
      };
      console.log('item', itemData);
      return this.quoteService.createItem(itemData);
    });

    forkJoin(itemRequests)
      .pipe(
        switchMap((itemResponses) => {
          const itemIds = itemResponses.map((res) => res.item_id);

          const optionData = {
            description: 'Items del costo',
            items: itemIds,
          };
          console.log('option', optionData);
          return this.quoteService.createOption(optionData).pipe(
            switchMap((optionResponse) => {
              const optionId = optionResponse.option_id;

              const dataCost = {
                items: optionId,
                work_order_id: this.selectedOrderWork?.id,
              };
              console.log('cost', dataCost);
              return this.costService.createCosts(dataCost);
            })
          );
        })
      )
      .subscribe({
        next: (res) => {
          this.localStorageService.removeItem('costs');
          this.handleCreated.emit();
          this.close();
          this.loadingCreate = false;
        },
        error: (err) => {
          console.error('Error en el proceso de creación:', err);
          this.loadingCreate = false;
        },
      });
  }

  editCost() {
    this.loadingCreate = true;
    this.verify();
    if (this.errorMessage !== '') {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Todos los campos son requeridos',
      });
      return;
    }
    this.loadingCreate = true;
    let costQuote: any = {};
    //actualizar los items
    if (this.itemsPorOpcion.optionId !== 0) {
      //crear items nuevos
      for (
        let j = 0;
        j < this.itemsPorOpcion.items.length - this.itemsDelete;
        j++
      ) {
        if (this.itemsPorOpcion.items[j].id !== undefined) {
          if (this.itemsPorOpcion.items[j].id === 0) {
            const itemToCreateData = {
              description: this.itemsPorOpcion.items[j].description,
              units: this.itemsPorOpcion.items[j].units,
              amount: this.itemsPorOpcion.items[j].amount,
              unit_value: this.itemsPorOpcion.items[j].unit_value,
            };

            const payload = {
              items: [itemToCreateData],
            };

            this.quoteService.itemToOption(
              this.itemsPorOpcion.optionId,
              payload
            );
          }
        }

        //editar los items
        const editedItem = this.itemsPorOpcion.items[j];
        const item = this.costToEdit?.items.items[j]; // Obtener el item original de la cotización
        // Suponiendo que el orden se mantiene
        let itemData = {};
        if (item !== undefined) {
          if (editedItem.description !== item.description) {
            itemData = {
              ...itemData,
              description: editedItem.description,
            };
          }
          let unitValue = this.getUnitValue(editedItem.units);
          if (unitValue === 'unknown') {
            unitValue = editedItem.units;
          }
          if (unitValue !== item.units) {
            itemData = {
              ...itemData,
              units: unitValue,
            };
          }
          if (
            editedItem.amount !== item.amount &&
            editedItem.amount &&
            item.amount
          ) {
            itemData = {
              ...itemData,
              amount: editedItem.amount,
            };
          }

          if (
            Number(editedItem.unit_value) !== Number(item.unit_value) &&
            Number(item.unit_value) &&
            item.unit_value
          ) {
            itemData = {
              ...itemData,
              unit_value: Number(editedItem.unit_value),
            };
          }

          if (Object.keys(itemData).length > 0) {
            this.quoteService.updateItem(editedItem.id, itemData).subscribe({
              next: (response) => {
                console.log('');
              },
              error: (error) => {
                console.error('Error al actualizar item', error);
              },
            });
          }
        }
      }
    }

    //eliminar los items
    if (this.itemsToDelete.length > 0) {
      for (let index = 0; index < this.itemsToDelete.length; index++) {
        const item = this.itemsToDelete[index];
        this.quoteService.deleteItem(item).subscribe({
          next: () => {},
          error: (error) => {
            console.error('Error al eliminar item', error);
          },
        });
      }
    }
    this.costService.editCost(costQuote, this.costToEdit?.id || 0).subscribe({
      next: (response) => {},
      error: (err) => {
        console.log(err);
      },
    });
    //cerrar el form
    setTimeout(() => {
      this.localStorageService.removeItem('costs');
      this.handleCreated.emit();
      this.close();
      this.loadingCreate = false;
    }, 3000);
  }

  loadOrderWorks() {
    this.costService.getCostsWithoutCosts().subscribe({
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

  onOrderChange() {
    if (this.selectedOrderWork && this.selectedOrderWork.id !== undefined) {
      this.validOrder = true;
    } else {
      this.validOrder = false;
    }
  }
  updateTotalPrice() {
    this.totalPrice = this.itemsPorOpcion.items.reduce(
      (sum, item) => sum + (item.total_value || 0),
      0
    );
  }
  search(event: AutoCompleteCompleteEvent) {
    const query = event.query.toLowerCase();

    this.filteredUnits = this.units.filter((unit) =>
      unit.toLowerCase().includes(query)
    );
  }
  updatePrice() {
    this.itemsPorOpcion.items.forEach((item) => {
      item.total_value = item.unit_value * (item.amount || 0);
    });
  }

  getTotalPrice(): number {
    return this.itemsPorOpcion.items.reduce((sum, item) => {
      const value = Number(item.total_value);
      return sum + (!isNaN(value) ? value : 0);
    }, 0);
  }

  addItem() {
    this.itemsAdd = this.itemsAdd + 1;
    this.itemsPorOpcion.items.push({
      id: 0, // Genera un id único temporal
      description: '',
      total_value: 0,
      units: '',
      amount: 0,
      unit_value: 0,
    });
  }
  removeItem(itemIndex: number, itemId: number) {
    this.itemsPorOpcion.items.splice(itemIndex, 1);

    if (itemId !== 0) {
      this.itemsToDelete.push(itemId);
      this.itemsDelete = this.itemsToDelete.length;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['visible']) {
      this.loadOrderWorks();
      if (this.action === 0) {
        this.actionTittle = 'Crear nuevo costo';
      } else if (this.action === 1) {
        this.actionTittle = 'Editar costo';
      }
    }
    if (changes['costToEdit'] && this.costToEdit) {
      this.selectedOrderWork = this.costToEdit.work_order;
      this.itemsPorOpcion = {
        name: this.costToEdit.items.name,
        optionId: this.costToEdit.items.id,
        items: this.costToEdit.items.items.map((item) => ({
          id: item.id,
          description: item.description,
          units: item.units,
          total_value: item.total_value,
          amount: item.amount,
          unit_value: item.unit_value,
        })),
      };
    }
  }

  getUnitValue(unit: string): string {
    const unitMap: { [key: string]: string } = {
      Metros: 'M',
      Centímetros: 'CM',
      Milímetros: 'MM',
      Kilómetros: 'KM',
      Pulgadas: 'IN',
      'Metros cuadrados (m2)': 'M2',
      'Centímetros cuadrados (cm2)': 'CM2',
      'Metros cubicos (m3)': 'M3',
      'Centímetros (cm3)': 'CM3',
      'Metro Lineal (ml)': 'ML',
      Pies: 'FT',
      Kilogramos: 'KG',
      Gramos: 'G',
      Miligramos: 'MG',
      Libras: 'LB',
      Toneladas: 'T',
      Litros: 'L',
      Mililitros: 'ML',
      Galones: 'GAL',
      Unidades: 'UND',
      Docenas: 'DZ',
      Cajas: 'CAJA',
      Pares: 'PAR',
    };

    return unitMap[unit] ?? 'unknown';
  }
}
