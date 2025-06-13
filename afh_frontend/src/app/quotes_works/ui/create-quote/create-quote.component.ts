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
import { AutoComplete, AutoCompleteModule } from 'primeng/autocomplete';
import { forkJoin } from 'rxjs';

interface Item {
  id: number;
  description: string;
  units: string;
  total_value: number;
  amount: number;
  unit_value: number;
}

interface Option {
  id: number;
  name: string;
  total_value: number;
  items: Item[];
}

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface Quote {
  id: number;
  customer: Customer;
  code: string;
  description: string;
  issue_date: number;
  options: Option[];
  state: number;
  tasks: string[];
}

interface AutoCompleteCompleteEvent {
  originalEvent: Event;
  query: string;
}

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
    items: {
      id: number;
      description: string;
      units: string;
      total_value: number;
      amount: number;
      unit_value: number;
    }[];
  }[] = [];
  tasks: { descripcion: string }[] = [{ descripcion: '' }];
  description: string = '';
  tasksQuote: String[] = [];
  items: Item[] = [];
  totalPrice: number = 0;
  optionsSelected: number = 0;
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
  loadingEdit: boolean = false;
  @Input() visible: boolean = false;
  @Input() action: number = 0; // 0: Create, 1: Edit
  @Input() quoteToEdit: Quote | null = null;
  @Output() closeDialog = new EventEmitter<void>();
  @Output() onQuoteCreated = new EventEmitter<void>();

  // clientErrorMessage: string = '';
  // descriptionErrorMessage: string = '';
  // taskDescriptionErrorMessage: string = '';
  // selectedOptionsErrorMessage: string = '';
  // itemDescriptionErrorMessage: string = '';
  // itemUnitsErrorMessage: String = '';
  // itemAmountErrorMessage: String = '';
  // itemUnitValueErrorMessage: String = '';
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
      (this.optionsSelected === 0 && this.action === 0)
    ) {
      this.errorMessage = 'Campo obligatorio';
    }

    for (let i = 0; i < this.tasks.length; i++) {
      if (this.tasks[i].descripcion === '') {
        this.errorMessage = 'Campo obligatorio';
      }
    }

    for (let i = 0; i < this.itemsPorOpcion.length; i++) {
      for (let j = 0; j < this.itemsPorOpcion[i].items.length; j++) {
        if (
          (this.itemsPorOpcion[i].items[j].description === '' ||
            this.itemsPorOpcion[i].items[j].amount === 0,
          this.itemsPorOpcion[i].items[j].unit_value === 0,
          this.itemsPorOpcion[i].items[j].units === '')
        ) {
          this.errorMessage = 'Campo obligatorio';
        }
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
    const optionsToSend: number[] = [];

    const createAllItems = async () => {
      const optionItemIds: number[][] = [];

      for (const optionItems of this.itemsPorOpcion) {
        const itemIds: number[] = [];

        for (const item of optionItems.items) {
          const itemData = {
            description: item.description,
            units: item.units,
            amount: item.amount,
            unit_value: item.unit_value,
          };

          try {
            const response: any = await this.quoteService
              .createItem(itemData)
              .toPromise();
            itemIds.push(response.item_id);
          } catch (error) {
            console.error('Error al crear item', error);
          }
        }

        optionItemIds.push(itemIds);
      }

      return optionItemIds;
    };

    const createAllOptions = async (optionItemIds: number[][]) => {
      for (const itemIds of optionItemIds) {
        const optionData = {
          description:
            'Opción ' +
            (optionsToSend.length + 1) +
            ' para ' +
            this.description,
          items: itemIds,
        };

        try {
          const response: any = await this.quoteService
            .createOption(optionData)
            .toPromise();
          optionsToSend.push(response.option_id);
        } catch (error) {
          console.error('Error al crear opción', error);
        }
      }
    };

    const createFinalQuote = async () => {
      const quoteData = {
        description: this.description,
        customer_id: this.selectedCustomer?.id,
        options: optionsToSend,
        tasks: this.tasks.map((t) => t.descripcion),
      };

      try {
        await this.quoteService.createQuote(quoteData).toPromise();
        this.onQuoteCreated.emit();
        this.close();
      } catch (error) {
        console.error('Error al crear cotización', error);
      }
    };

    // Encadenar todo
    createAllItems()
      .then((optionItemIds) => createAllOptions(optionItemIds))
      .then(() => createFinalQuote());
  }

  //pasamos de 236 lineas a 170
  editQuote() {
    this.loadingEdit = true;
    let quoteData: any = {};

    //verifica si hay que cambiar la descripcion
    if (this.description !== this.quoteToEdit?.description) {
      console.log('editando descripcin de la cotizacion');
      quoteData.description = this.description;
    }
    //verifica si hay que cambiar el cliente
    if (this.selectedCustomer?.id !== this.quoteToEdit?.customer.id) {
      console.log('editando cliente');
      quoteData.customer_id = this.selectedCustomer?.id;
    }
    //verifica si hay que cambiar las tareas
    if (this.tasks.length > 0) {
      console.log('editando tareas');
      quoteData.tasks = this.tasks.map((t) => t.descripcion);
    }
    //actualizar los items
    for (let i = 0; i < this.itemsPorOpcion.length; i++) {
      console.log(this.itemsPorOpcion);
      //crear opciones nuevas y sus respectivos ids
      if (this.itemsPorOpcion[i].optionId === 0) {
        console.log('entrando para crear opciones');
        let itemsToCreateIdList: number[] = [];
        let length = this.itemsPorOpcion[i].items.length;
        for (let j = 0; j < length; j++) {
          console.log('entrando para crear items a la nueva opcion');
          console.log('estructura item', this.itemsPorOpcion[i].items[j]);
          this.quoteService
            .createItem(this.itemsPorOpcion[i].items[j])
            .subscribe({
              next: (response) => {
                console.log('item creado para nueva opcion', response);
                itemsToCreateIdList.push(response.item_id);
                console.log(itemsToCreateIdList);
              },
              error: (err) => {
                console.log('error', err);
              },
            });
        }
        let quoteId = this.quoteToEdit!.id;
        let name = 'Opción ' + (i + 1) + ' para ' + this.description;
        let optionCreateData = {
          description: name,
          items: itemsToCreateIdList,
        };

        setTimeout(() => {
          console.log('option a crear', optionCreateData);
          this.quoteService.optionToQuote(quoteId, optionCreateData);
        }, 2000);
      }
      console.log('id de la opcion', this.itemsPorOpcion[i].optionId);
      if (this.itemsPorOpcion[i].optionId !== 0) {
        console.log('id del item', this.itemsPorOpcion[i].optionId);
        //crear items nuevos
        for (
          let j = 0;
          j < this.itemsPorOpcion[i].items.length - this.itemsDelete;
          j++
        ) {
          if (this.itemsPorOpcion[i].items[j].id !== undefined) {
            if (this.itemsPorOpcion[i].items[j].id === 0) {
              const itemToCreateData = {
                description: this.itemsPorOpcion[i].items[j].description,
                units: this.itemsPorOpcion[i].items[j].units,
                amount: this.itemsPorOpcion[i].items[j].amount,
                unit_value: this.itemsPorOpcion[i].items[j].unit_value,
              };

              const payload = {
                items: [itemToCreateData],
              };

              this.quoteService.itemToOption(
                this.itemsPorOpcion[i].optionId,
                payload
              );
            }
          }

          //editar los items
          const editedItem = this.itemsPorOpcion[i].items[j];
          const item = this.itemsPorOpcion[i].items[j]; // Suponiendo que el orden se mantiene
          let itemData = {};
          if (item !== undefined) {
            itemData = {
              ...itemData,
              description: editedItem.description,
            };
            itemData = {
              ...itemData,
              units: editedItem.units,
            };

            if (
              editedItem.amount !== item.amount &&
              editedItem.amount &&
              item.amount &&
              typeof item.amount === 'number'
            ) {
              itemData = {
                ...itemData,
                amount: item.amount,
              };
            }

            if (
              editedItem.unit_value !== item.unit_value &&
              editedItem.unit_value &&
              item.unit_value &&
              typeof item.unit_value === 'number'
            ) {
              itemData = {
                ...itemData,
                unit_value: editedItem.unit_value,
              };
            }

            if (editedItem.id !== 0) {
              console.log('id del item antes de actualizar', editedItem.id);
              this.quoteService.updateItem(editedItem.id, itemData).subscribe({
                next: (response) => {
                  console.log('item actualizado', response);
                },
                error: (error) => {
                  console.error('Error al actualizar item', error);
                },
              });
            }
          }
        }
      }
    }

    //eliminar los items
    if (this.itemsToDelete.length > 0) {
      console.log('entrando para editar');
      for (let index = 0; index < this.itemsToDelete.length; index++) {
        console.log('continuando para editar');
        const item = this.itemsToDelete[index];
        this.quoteService.deleteItem(item).subscribe({
          next: () => {
            console.log('item eliminado');
          },
          error: (error) => {
            console.error('Error al eliminar item', error);
          },
        });
      }
    }
    this.quoteService.updateQuote(this.quoteToEdit!.id, quoteData).subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (err) => {
        console.log(err);
      },
    });
    //eliminar las opciones
    this.quoteService.deleteOptions(this.optionsToDelete);
    //cerrar el form
    setTimeout(() => {
      this.onQuoteCreated.emit();
      this.close();
      this.loadingEdit = false;
    }, 3000);
  }

  updateTotalPrice() {
    this.totalPrice = this.itemsPorOpcion.reduce(
      (sum, itemsObj) =>
        sum +
        itemsObj.items.reduce((s, item) => s + (item.total_value || 0), 0),
      0
    );
  }

  updatePrice() {
    this.itemsPorOpcion.forEach((optionObj) => {
      optionObj.items.forEach((item) => {
        item.total_value = item.unit_value * (item.amount || 1);
      });
    });
  }

  getTotalPrice(opcionIndex: number): number {
    return this.itemsPorOpcion[opcionIndex].items.reduce((sum, item) => {
      const value = Number(item.total_value);
      return sum + (!isNaN(value) ? value : 0);
    }, 0);
  }

  updateOptionsSelected() {
    if (this.itemsPorOpcion.length === 0) {
      this.itemsPorOpcion = [];

      for (let i = 0; i < this.optionsSelected; i++) {
        this.itemsPorOpcion.push({
          name: '',
          optionId: 0,
          items: [
            {
              id: 0,
              description: '',
              total_value: 0,
              units: '',
              amount: 0,
              unit_value: 0,
            },
          ],
        });
      }
    } else {
      this.itemsPorOpcion.push({
        name: '',
        optionId: 0,
        items: [
          {
            id: 0,
            description: '',
            total_value: 0,
            units: '',
            amount: 0,
            unit_value: 0,
          },
        ],
      });
    }
    console.log('option agregado', this.itemsPorOpcion);
  }

  addItem(index: number) {
    this.itemsAdd = this.itemsAdd + 1;
    this.itemsPorOpcion[index].items.push({
      id: 0, // Genera un id único temporal
      description: '',
      total_value: 0,
      units: '',
      amount: 0,
      unit_value: 0,
    });
  }

  removeItem(opcionIndex: number, itemIndex: number, itemId: number) {
    this.itemsPorOpcion[opcionIndex].items.splice(itemIndex, 1);

    if (itemId !== 0) {
      this.itemsToDelete.push(itemId);
      console.log('dentro de la condicion', this.itemsToDelete);
      this.itemsDelete = this.itemsToDelete.length;
    }
    console.log(this.itemsToDelete);
  }

  removeOption(optionIndex: number, optionId: number) {
    this.optionsToDelete.push(optionId);
    if ((optionId = 0)) {
      this.optionsToDelete.push(optionId);
    }
    console.log(this.optionsToDelete);
    this.itemsPorOpcion.splice(optionIndex, 1);
  }

  addTask() {
    this.tasks.push({ descripcion: '' });
  }

  removeTask(index: number) {
    this.tasks.splice(index, 1);
  }

  resetForm() {
    this.actionTittle = 'Crear';
    this.description = '';
    this.selectedCustomer = null;
    this.tasks = [{ descripcion: '' }];
    this.tasksQuote = [];
    this.itemsPorOpcion = [];
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
      this.selectedCustomer = this.quoteToEdit.customer;
      this.tasks = this.quoteToEdit.tasks.map((t) => ({ descripcion: t }));
      this.itemsPorOpcion = this.quoteToEdit.options.map((option, idx) => ({
        name: option.name,
        optionId: option.id,
        items: option.items.map((item) => ({
          id: item.id,
          description: item.description,
          units: item.units,
          total_value: item.total_value,
          amount: item.amount,
          unit_value: item.unit_value,
        })),
      }));
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
        console.log('cotizacion a editar', this.quoteToEdit);
        this.description = this.quoteToEdit.description;
        this.selectedCustomer =
          this.customers.find((c) => c.id === this.quoteToEdit?.customer.id) ||
          null;

        this.tasks = this.quoteToEdit.tasks.map((t) => ({ descripcion: t }));
        this.optionsSelected = this.quoteToEdit.options.length;
        this.itemsPorOpcion = this.quoteToEdit.options.map((option, idx) => ({
          name: option.name,
          optionId: option.id,
          items: option.items.map((item) => ({
            id: item.id,
            description: item.description,
            units: item.units,
            total_value: item.total_value,
            amount: item.amount,
            unit_value: item.unit_value,
          })),
        }));
        console.log('items por opcion', this.itemsPorOpcion);
      }
    }
  }
}
