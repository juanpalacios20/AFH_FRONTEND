import { CommonModule, NgIf } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { QuoteService } from '../../services/quote.service';
import { ClientService } from '../../../clients/services/client.service';
import {
  AutoComplete,
  AutoCompleteCompleteEvent,
  AutoCompleteModule,
} from 'primeng/autocomplete';
import { forkJoin } from 'rxjs';
import { Customer, Item, Quote } from '../../../interfaces/models';

@Component({
  selector: 'app-create-quote',
  standalone: true,
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
    NgIf,
    AutoComplete,
    ToastModule,
  ],
  templateUrl: './create-quote.component.html',
  styleUrls: ['./create-quote.component.css'],
  providers: [MessageService, AutoCompleteModule],
})
export default class CreateQuoteComponent implements OnChanges, OnInit {
  actionTittle: string = 'Crear';
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

  tasks: { descripcion: string }[] = [{ descripcion: '' }];
  description: string = '';
  tasksQuote: String[] = [];
  items: Item[] = [];
  totalPrice: number = 0;
  optionsSelected: number = 0;
  construction_company: string = '';
  administration: number = 0;
  unexpected: number = 0;
  utility: number = 0;
  customers: Customer[] = [];
  selectedCustomer: Customer | null = null;
  filteredCustomers: any[] | undefined;
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
  ];
  valueUnits: string = '';
  filteredUnits: string[] = [];
  itemsToDelete: number[] = [];
  itemsAdd: number = 0;
  optionsToDelete: number[] = [];
  itemsDelete: number = 0;
  newItemsIds: number[] = [];
  loading: boolean = false;
  ivaPercentage: number = 0.19; // Variable que debe actualizarse segun el valor del iva actual en colombia
  method_of_payment: string = '';
  @Input() visible: boolean = false;
  @Input() action: number = 0; // 0: Create, 1: Edit
  @Input() quoteToEdit: Quote | null = null;
  @Output() closeDialog = new EventEmitter<void>();
  @Output() onQuoteCreated = new EventEmitter<void>();
  errorMessage: String = '';

  constructor(
    private quoteService: QuoteService,
    private clientService: ClientService,
    private messageService: MessageService
  ) {}

  verify() {
    if (
      this.selectedCustomer === null ||
      this.selectedCustomer === undefined ||
      this.description === '' ||
      this.method_of_payment === ''
    ) {
      this.errorMessage = 'Campo obligatorio';
    }

    if (
      (this.utility === 0 ||
        this.administration === 0 ||
        this.unexpected === 0) &&
      this.construction_company !== ''
    ) {
      this.errorMessage = 'Campo obligatorio';
    }

    for (let i = 0; i < this.tasks.length; i++) {
      if (this.tasks[i].descripcion === '') {
        this.errorMessage = 'Campo obligatorio';
      }
    }

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
  search(event: AutoCompleteCompleteEvent) {
    const query = event.query.toLowerCase();

    this.filteredUnits = this.units.filter((unit) =>
      unit.toLowerCase().includes(query)
    );
  }

  filterCustomer(event: AutoCompleteCompleteEvent) {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.customers.length; i++) {
      let customer = this.customers[i];
      if (customer.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(customer);
      }
    }

    this.filteredCustomers = filtered;
  }

  loadCustomers() {
    this.clientService.getClients().subscribe({
      next: (response: any) => {
        this.customers = response.map((client: any) => ({
          id: client.id,
          name: client.name,
          email: client.email,
          phone: client.phone,
        }));
      },
    });
  }

  ngOnInit() {
    this.loadCustomers();
  }

  submit() {
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
      this.submitQuote();
    } else if (this.action === 1) {
      this.editQuote();
    }
  }

  submitQuote() {
    this.loading = true;
    this.verify();
    if (this.errorMessage !== '') {
      this.loading = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Todos los campos son requeridos',
      });
      return;
    }
    let optionId: number = 0;

    const itemRequests = this.itemsPorOpcion.items.map((item) => {
      const itemData = {
        description: item.description,
        units: item.units,
        amount: item.amount,
        unit_value: item.unit_value,
      };
      return this.quoteService.createItem(itemData);
    });

    forkJoin(itemRequests).subscribe({
      next: (responses) => {
        const itemIds = responses.map((res) => res.item_id);

        const optionData = {
          description: 'Opción para ' + this.description,
          items: itemIds,
        };
        this.quoteService.createOption(optionData).subscribe({
          next: (response) => {
            optionId = response.option_id;
            const quoteData = {
              description: this.description,
              customer_id: this.selectedCustomer?.id,
              options: optionId,
              tasks: this.tasks.map((t) => t.descripcion),
              iva: this.ivaPercentage,
              administration: this.administration / 100,
              unforeseen: this.unexpected / 100,
              utility: this.utility / 100,
              method_of_payment: this.method_of_payment,
              construction: this.construction_company
                ? this.construction_company
                : null,
            };
            this.quoteService.createQuote(quoteData).subscribe({
              next: (res) => {
                console.log('Cotización creada', res);
              },
              error: (err) => {
                console.log('Error al crear cotización', err);
              },
            });
          },
          error: (err) => {
            console.log('Error al crear opción', err, optionData);
          },
        });
      },
      error: (err) => {
        console.log('Error al crear items', err);
      },
    });
    setTimeout(() => {
      this.onQuoteCreated.emit();
      this.close();
      this.loading = false;
    }, 2000);
  }

  editQuote() {
    this.verify();
    if (this.errorMessage !== '') {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Todos los campos son requeridos',
      });
      return;
    }
    this.loading = true;
    let quoteData: any = {};

    if (this.administration !== this.quoteToEdit?.administration) {
      quoteData.administration = this.administration / 100;
    }
    if (this.unexpected !== this.quoteToEdit?.unforeseen) {
      quoteData.unforeseen = this.unexpected / 100;
    }
    if (this.utility !== this.quoteToEdit?.utility) {
      quoteData.utility = this.utility / 100;
    }
    if (this.method_of_payment !== this.quoteToEdit?.method_of_payment) {
      quoteData.method_of_payment = this.method_of_payment;
    }
    if (this.quoteToEdit) {
      if (this.construction_company !== this.quoteToEdit.construction) {
        quoteData.construction = this.construction_company;
      }
    }
    //verifica si hay que cambiar la descripcion
    if (this.description !== this.quoteToEdit?.description) {
      quoteData.description = this.description;
    }
    //verifica si hay que cambiar el cliente
    if (this.selectedCustomer?.id !== this.quoteToEdit?.customer.id) {
      quoteData.customer_id = this.selectedCustomer?.id;
    }
    //verifica si hay que cambiar las tareas
    if (this.tasks.length > 0) {
      quoteData.tasks = this.tasks.map((t) => t.descripcion);
    }
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
        const item = this.quoteToEdit?.options.items[j]; // Obtener el item original de la cotización
        // Suponiendo que el orden se mantiene
        let itemData = {};
        if (item !== undefined) {
          if (editedItem.description !== item.description) {
            itemData = {
              ...itemData,
              description: editedItem.description,
            };
          }

          if (editedItem.units !== item.units) {
            itemData = {
              ...itemData,
              units: editedItem.units,
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
            editedItem.unit_value !== Number(item.unit_value) &&
            Number(item.unit_value) &&
            item.unit_value
          ) {
            itemData = {
              ...itemData,
              unit_value: Number(editedItem.unit_value),
            };
          }

          if (editedItem.id !== 0) {
            this.quoteService.updateItem(editedItem.id, itemData).subscribe({
              next: (response) => {},
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
    this.quoteService.updateQuote(this.quoteToEdit!.id, quoteData).subscribe({
      next: (response) => {},
      error: (err) => {
        console.log(err);
      },
    });
    //cerrar el form
    setTimeout(() => {
      this.onQuoteCreated.emit();
      this.close();
      this.loading = false;
    }, 3000);
  }

  updateTotalPrice() {
    this.totalPrice = this.itemsPorOpcion.items.reduce(
      (sum, item) => sum + (item.total_value || 0),
      0
    );
  }

  updatePrice() {
    this.itemsPorOpcion.items.forEach((item) => {
      item.total_value = item.unit_value * (item.amount || 1);
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

  addTask() {
    this.tasks.push({ descripcion: '' });
  }

  removeTask(index: number) {
    this.tasks.splice(index, 1);
  }

  resetForm() {
    this.actionTittle = 'Crear';
    this.construction_company = '';
    this.administration = 0;
    this.unexpected = 0;
    this.utility = 0;
    this.method_of_payment = '';
    this.description = '';
    this.selectedCustomer = null;
    this.tasks = [{ descripcion: '' }];
    this.tasksQuote = [];
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
    this.valueUnits = '';
    this.totalPrice = 0;
    this.optionsSelected = 0;
    this.itemsToDelete = [];
    this.itemsAdd = 0;
    this.itemsDelete = 0;
    this.newItemsIds = [];
    this.errorMessage = '';
  }

  loadEditData() {
    this.actionTittle = 'Editar';
    if (this.quoteToEdit) {
      this.description = this.quoteToEdit.description;
      this.administration = this.quoteToEdit.administration * 100;
      this.unexpected = this.quoteToEdit.unforeseen * 100;
      this.utility = this.quoteToEdit.utility * 100;
      this.method_of_payment = this.quoteToEdit.method_of_payment;
      this.construction_company = this.quoteToEdit.construction || '';
      this.ivaPercentage = this.quoteToEdit.iva;
      this.selectedCustomer = this.quoteToEdit.customer;
      this.tasks = this.quoteToEdit.tasks.map((t) => ({ descripcion: t }));
      this.itemsPorOpcion = {
        name: this.quoteToEdit.options.name,
        optionId: this.quoteToEdit.options.id,
        items: this.quoteToEdit.options.items.map((item) => ({
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

  close() {
    this.resetForm();
    this.closeDialog.emit();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['visible']) {
      if (this.action === 0) {
        this.actionTittle = 'Crear cotización';
      } else if (this.action === 1) {
        this.loadEditData();
        this.actionTittle = 'Editar cotización';
      }
    }
    if (changes['quoteToEdit'] && this.quoteToEdit) {
      if (this.action === 1 && this.quoteToEdit) {
        this.description = this.quoteToEdit.description;
        this.administration = this.quoteToEdit.administration * 100;
        this.unexpected = this.quoteToEdit.unforeseen * 100;
        this.utility = this.quoteToEdit.utility * 100;
        this.method_of_payment = this.quoteToEdit.method_of_payment;
        this.ivaPercentage = this.quoteToEdit.iva;
        this.selectedCustomer =
          this.customers.find((c) => c.id === this.quoteToEdit?.customer.id) ||
          null;

        this.tasks = this.quoteToEdit.tasks.map((t) => ({ descripcion: t }));
        this.optionsSelected = 1;
        this.itemsPorOpcion = {
          name: this.quoteToEdit.options.name,
          optionId: this.quoteToEdit.options.id,
          items: this.quoteToEdit.options.items.map((item) => ({
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
  }

  preventNonNumericInput(event: KeyboardEvent) {
    const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    if (!allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  }
}
