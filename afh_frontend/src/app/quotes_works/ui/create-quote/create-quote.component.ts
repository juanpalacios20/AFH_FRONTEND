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
    id: number;
    description: string;
    units: string;
    total_value: number;
    amount: number;
    unit_value: number;
  }[][] = [];
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
      this.opcionParaEditar();
    }
  }

  submitQuote() {
    console.log(this.selectedCustomer, this.selectedCustomer?.id);
    const optionsToSend: number[] = [];

    const createAllItems = async () => {
      const optionItemIds: number[][] = [];

      for (const optionItems of this.itemsPorOpcion) {
        const itemIds: number[] = [];

        for (const item of optionItems) {
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
          description: 'Opción generada automáticamente',
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

  opcionParaEditar() {
    const quoteId = this.quoteToEdit?.id;
    const optionIds = this.quoteToEdit?.options.map((o) => o.id) || [];
    let quoteData = {};

    if (this.description !== this.quoteToEdit?.description) {
      console.log('Descripción editada:', this.description);
      quoteData = {
        description: this.description,
      };
      console.log('quoteData enviado al backend:', quoteData);
    }
    if (this.selectedCustomer?.id !== this.quoteToEdit?.customer.id) {
      quoteData = {
        ...quoteData,
        customer_id: this.selectedCustomer?.id,
      };
    }
    if (this.tasks.length > 0) {
      quoteData = {
        ...quoteData,
        tasks: this.tasks.map((t) => t.descripcion),
      };
    }

    for (let i = 0; i < this.itemsPorOpcion.length; i++) {
      console.log("entrando a editar items de la opción", i);
      const option = this.quoteToEdit!.options;
      for (let j = 0; j < option[i].items.length; j++) {
        const editedItem = this.itemsPorOpcion[i][j];
        const item = option[i].items[j]; // Suponiendo que el orden se mantiene
        let itemData = {};
        if (editedItem.description !== item.description) {
          itemData = {
            ...itemData,
            description: editedItem.description,
          };
        } if (editedItem.units !== item.units) {
          itemData = {
            ...itemData,
            units: editedItem.units,
          };
        } if (editedItem.amount !== item.amount) {
          itemData = {
            ...itemData,
            amount: editedItem.amount,
          };
        } if (editedItem.unit_value !== item.unit_value) {
          itemData = {
            ...itemData,
            unit_value: editedItem.unit_value,
          };
        }
        console.log('itemData editado:', itemData);
        this.quoteService.updateItem(item.id, itemData).subscribe({
            next: (response) => {
              console.log('Item actualizado:', response);
            },
            error: (error) => {
              console.error('Error al actualizar item', error);
            },
          });
      }
    }

    console.log('quoteData enviado al backend:', quoteData);
    this.quoteService.updateQuote(quoteId!, quoteData).subscribe({
      next: (response) => {
        console.log('Cotización actualizada:', response);
      },
      error: (error) => {
        console.error('Error al actualizar cotización', error);
      },
    });
    this.onQuoteCreated.emit();
    this.close();
  }

  updateQuote() {
    const quoteId = this.quoteToEdit?.id;
    const optionIds = this.quoteToEdit?.options.map((o) => o.id) || [];

    if (!quoteId || !optionIds.length) {
      console.error('Faltan datos para actualizar.');
      return;
    }

    const updateAllItems = async () => {
      const updatedOptionItemIds: number[][] = [];

      for (let i = 0; i < this.itemsPorOpcion.length; i++) {
        const itemIds: number[] = [];
        const option = this.quoteToEdit!.options[i];

        for (let j = 0; j < this.itemsPorOpcion[i].length; j++) {
          const editedItem = this.itemsPorOpcion[i][j];
          const item = option.items[j]; // Suponiendo que el orden se mantiene

          const itemData = {
            description: editedItem.description,
            units: editedItem.units,
            amount: editedItem.amount,
            unit_value: editedItem.unit_value,
          };
          console.log('itemData enviado al backend:', itemData);

          try {
            const response = await this.quoteService
              .updateItem(item.id, itemData)
              .toPromise();
            itemIds.push(item.id); // Los ids no cambian
          } catch (error) {
            console.error('Error al actualizar item', error);
          }
        }

        updatedOptionItemIds.push(itemIds);
      }

      return updatedOptionItemIds;
    };

    const updateAllOptions = async (updatedOptionItemIds: number[][]) => {
      for (let i = 0; i < updatedOptionItemIds.length; i++) {
        const optionData = {
          items: updatedOptionItemIds[i],
        };

        try {
          await this.quoteService
            .updateOption(optionIds[i], optionData)
            .toPromise();
        } catch (error) {
          console.error('Error al actualizar opción', error);
        }
      }
    };

    const updateMainQuote = async () => {
      const quoteData = {
        description: this.description,
        customer_id: this.selectedCustomer?.id,
        options: optionIds,
        tasks: this.tasks.map((t) => t.descripcion),
      };

      try {
        await this.quoteService.updateQuote(quoteId, quoteData).toPromise();
        this.onQuoteCreated.emit();
        this.close();
      } catch (error) {
        console.error('Error al actualizar cotización', error);
      }
    };

    // Ejecutar flujo completo
    updateAllItems()
      .then((updatedOptionItemIds) => updateAllOptions(updatedOptionItemIds))
      .then(() => updateMainQuote());

    this.close();
  }

  updateTotalPrice() {
    this.totalPrice = this.itemsPorOpcion.reduce(
      (sum, items) =>
        sum + items.reduce((s, item) => s + (item.total_value || 0), 0),
      0
    );
  }

  updatePrice() {
    this.itemsPorOpcion.forEach((items) => {
      items.forEach((item) => {
        item.total_value = item.unit_value * (item.amount || 1);
      });
    });
    this.updateTotalPrice();
  }

  updateOptionsSelected() {
    this.itemsPorOpcion = [];

    for (let i = 0; i < this.optionsSelected; i++) {
      this.itemsPorOpcion.push([
        {
          id: Date.now() + Math.floor(Math.random() * 10000),
          description: '',
          total_value: 0,
          units: '',
          amount: 0,
          unit_value: 0,
        },
      ]);
    }
  }

  addItem(index: number) {
    this.itemsPorOpcion[index].push({
      id: Date.now() + Math.floor(Math.random() * 10000), // Genera un id único temporal
      description: '',
      total_value: 0,
      units: '',
      amount: 0,
      unit_value: 0,
    });
  }

  removeItem(opcionIndex: number, itemIndex: number) {
    this.itemsPorOpcion[opcionIndex].splice(itemIndex, 1);
  }

  getTotalPrice(opcionIndex: number): number {
    return this.itemsPorOpcion[opcionIndex].reduce(
      (sum, item) => sum + (item.total_value || 0),
      0
    );
  }

  addTask() {
    this.tasks.push({ descripcion: '' });
  }

  removeTask(index: number) {
    this.tasks.splice(index, 1);
  }

  close() {
    this.visible = false;
    this.itemsPorOpcion = [];
    this.tasks = [{ descripcion: '' }];
    this.totalPrice = 0;
    this.optionsSelected = 0;
    this.description = '';
    this.selectedCustomer = null;
    this.valueUnits = '';
    this.quoteToEdit = null;
    this.closeDialog.emit();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['visible'] && this.visible) {
      if (this.action === 0) {
        this.actionTittle = 'Crear cotización';
      } else if (this.action === 1) {
        this.actionTittle = 'Editar cotización';
      }
    }
    if (changes['quoteToEdit'] && this.quoteToEdit) {
      if (this.action === 1 && this.quoteToEdit) {
        this.description = this.quoteToEdit.description;
        this.selectedCustomer =
          this.customers.find((c) => c.id === this.quoteToEdit?.customer.id) ||
          null;

        this.tasks = this.quoteToEdit.tasks.map((t) => ({ descripcion: t }));
        this.optionsSelected = this.quoteToEdit.options.length;
        this.itemsPorOpcion = this.quoteToEdit.options.map((option) =>
          option.items.map((item) => ({
            id: item.id,
            description: item.description,
            units: item.units,
            total_value: item.total_value,
            amount: item.amount,
            unit_value: item.unit_value,
          }))
        );
        // Set valueUnits to the first item's units if available
        if (
          this.quoteToEdit.options.length > 0 &&
          this.quoteToEdit.options[0].items.length > 0
        ) {
          this.valueUnits = this.quoteToEdit.options[0].items[0].units || '';
        }
      }
    }
  }
}
