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
  ],
  templateUrl: './create-quote.component.html',
  styleUrls: ['./create-quote.component.css'],
  providers: [MessageService, AutoCompleteModule],
})
export default class CreateQuoteComponent implements OnChanges, OnInit {
  actionTittle: string = 'Crear';
  itemsPorOpcion: {
    optionId: number;
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

  constructor(
    private quoteService: QuoteService,
    private clientService: ClientService
  ) {}

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
    if (this.action === 0) {
      this.submitQuote();
    } else if (this.action === 1) {
      this.opcionEditar();
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
            units: this.valueUnits,
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
            'Opción ' + (optionsToSend.length + 1) + 'para' + this.description,
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

  opcionEditar() {
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
      for (
        let j = 0;
        j <
        this.itemsPorOpcion[i].items.length - this.itemsDelete;
        j++
      ) {
        console.log(
          'se lee',
          this.itemsPorOpcion[i].items.length +
            this.itemsAdd -
            this.itemsDelete,
          'veces'
        );
        console.log(
          this.itemsPorOpcion[i].items.length,
          '+',
          this.itemsAdd,
          '-',
          this.itemsDelete
        );
        if (this.itemsPorOpcion[i].items[j].id !== undefined) {
          console.log('informacion', this.itemsPorOpcion[i].items[j].id);
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

            console.log('para crear un nuevo item', payload);

            this.quoteService.itemToOption(
              this.itemsPorOpcion[i].optionId,
              payload
            );
          }
        }
        const editedItem = this.itemsPorOpcion[i].items[j];
        console.log('items', this.itemsPorOpcion, i, j);
        console.log('id del item', this.itemsPorOpcion[i].items[j].id);
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
            console.log('informacion del item', itemData, editedItem.id);
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
    }, 5000);
  }

  async updateQuote() {
    this.loadingEdit = true;
    const quoteId = this.quoteToEdit?.id;
    const newOptionIds: number[] = [];
    const existingOptions = this.quoteToEdit?.options ?? [];
    const newOptionsToCreate = this.itemsPorOpcion.filter(
      (optionItems, idx) => {
        return !existingOptions[idx]; // Es una nueva opción si no hay opción con ese índice
      }
    );

    for (const optionItems of newOptionsToCreate) {
      try {
        interface CreatedItemResponse {
          item_id: number;
        }

        const createdItemIds: number[] = await Promise.all(
          optionItems.items.map(async (item: Item): Promise<number> => {
            // Si item no tiene id, lo creamos
            if (item.id === 0) {
              const res: CreatedItemResponse = await this.quoteService
                .createItem({
                  description: item.description,
                  units: item.units,
                  amount: item.amount,
                  unit_value: item.unit_value,
                })
                .toPromise();
              this.newItemsIds.push(res.item_id);
              return res.item_id;
            } else {
              return item.id;
            }
          })
        );
        if (this.newItemsIds.length > 0) {
          const optionResponse: any = await this.quoteService
            .createOption({
              description: 'Opción creada para ' + this.description,
              items: this.newItemsIds,
            })
            .toPromise();
          newOptionIds.push(optionResponse.option_id);
          this.newItemsIds = [];
        }
      } catch (error) {
        console.error('Error creando nueva opción:', error);
      }
    }
    let quoteData: any = {};

    if (this.description !== this.quoteToEdit?.description) {
      quoteData.description = this.description;
    }
    if (this.selectedCustomer?.id !== this.quoteToEdit?.customer.id) {
      quoteData.customer_id = this.selectedCustomer?.id;
    }
    if (this.tasks.length > 0) {
      quoteData.tasks = this.tasks.map((t) => t.descripcion);
    }

    // Agregar opciones nuevas a las ya existentes
    quoteData.options = [
      ...(this.quoteToEdit?.options.map((o) => o.id) ?? []),
      ...newOptionIds,
    ];

    try {
      await this.quoteService.updateQuote(quoteId!, quoteData).toPromise();
    } catch (error) {
      console.error('Error actualizando cotización:', error);
    }

    for (let i = 0; i < this.itemsPorOpcion.length; i++) {
      console.log('repito', this.itemsPorOpcion);
      const option = this.quoteToEdit!.options;
      if (
        this.itemsPorOpcion[i].items &&
        this.itemsPorOpcion[i].items[0] &&
        this.itemsPorOpcion[i].items[0].description === ''
      ) {
        this.quoteService.createOption(this.itemsPorOpcion[i].items[0]);
        for (let index = 0; index < option[i].items.length; index++) {
          this.quoteService.createItem(this.itemsPorOpcion[i].items[index]);
        }
      }
      if (option[i].items) {
        console.log('opciones', option[i].items);
        for (let j = 0; j < option[i].items.length - this.itemsDelete; j++) {
          const editedItem = this.itemsPorOpcion[i].items[j];
          const item = option[i].items[j]; // Suponiendo que el orden se mantiene
          let itemData = {};
          if (item !== undefined) {
            if (
              editedItem.description !== undefined &&
              item.description !== undefined &&
              editedItem.description !== item.description
            ) {
              itemData = {
                ...itemData,
                description: editedItem.description,
              };
            }
            if (
              editedItem.units !== item.units &&
              editedItem.units &&
              item.units
            ) {
              itemData = {
                ...itemData,
                units: editedItem.units,
              };
            }
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
              item.unit_value
            ) {
              itemData = {
                ...itemData,
                unit_value: editedItem.unit_value,
              };
            }
            this.quoteService.updateItem(item.id, itemData).subscribe({
              error: (error) => {
                console.error('Error al actualizar item', error);
              },
            });

            //si se agregan mas items
            console.log('items por porcion', this.itemsPorOpcion);
            if (this.itemsPorOpcion[i].items.length > option[i].items.length) {
              console.log('buscando errores');
              // Captura segura del número de ítems antes de cualquier modificación
              const originalLength = option[i].items.length;
              const newItems =
                this.itemsPorOpcion[i].items.slice(originalLength);

              // Evita modificar directamente el objeto referenciado
              const currentOption = JSON.parse(
                JSON.stringify(this.quoteToEdit!.options[i])
              );
              let optionData = {};
              for (const newItem of newItems) {
                console.log('nuevos items', newItems);
                const itemData = {
                  description: newItem.description,
                  units: newItem.units,
                  amount: newItem.amount,
                  unit_value: newItem.unit_value,
                };

                this.quoteService.createItem(itemData).subscribe({
                  next: (response) => {
                    if (currentOption && currentOption.items) {
                      currentOption.items.push({
                        id: response.item_id,
                        description: newItem.description,
                        units: newItem.units,
                        total_value: newItem.total_value,
                        amount: newItem.amount,
                        unit_value: newItem.unit_value,
                      });
                      optionData = {
                        name: currentOption.name,
                        items: [
                          ...option[i].items.map((item) => item.id),
                          response.item_id,
                        ],
                      };

                      this.quoteService
                        .updateOption(currentOption.id, optionData)
                        .subscribe({
                          next: (response) => {},
                          error: (error) => {
                            console.error('Error al actualizar opción', error);
                          },
                        });
                    } else {
                      console.error(
                        'currentOption o currentOption.items está vacío en el momento del push'
                      );
                    }

                    console.log('item creado');
                  },
                  error: (error) => {
                    console.error('Error al crear nuevo item', error);
                  },
                });
              }
            }
          }
        }
      }
    }
    console.log(
      'antes de leer la condicion',
      this.itemsToDelete.length,
      this.itemsToDelete
    );
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
    this.quoteService.deleteOptions(this.optionsToDelete);
    setTimeout(() => {
      this.onQuoteCreated.emit();
      this.close();
      this.loadingEdit = false;
    }, 5000);
    console.log('por aqui ando otra vez');
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
          optionId: i,
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
        optionId: this.itemsPorOpcion.length,
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
  }

  loadEditData() {
    this.actionTittle = 'Editar';
    if (this.quoteToEdit) {
      this.description = this.quoteToEdit.description;
      this.selectedCustomer = this.quoteToEdit.customer;
      this.tasks = this.quoteToEdit.tasks.map((t) => ({ descripcion: t }));
      this.itemsPorOpcion = this.quoteToEdit.options.map((option, idx) => ({
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
