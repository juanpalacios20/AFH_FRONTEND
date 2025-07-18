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
import { ConfirmationService, MessageService } from 'primeng/api';
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
import { forkJoin, switchMap } from 'rxjs';
import { Customer, Item, Quote } from '../../../interfaces/models';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { InputNumber } from 'primeng/inputnumber';

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
    InputNumber,
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
  contractor_contribution: { descripcion: string }[] = [
    { descripcion: 'Elementos de protección personal' },
    { descripcion: 'Herramientas manuales y eléctricas' },
    { descripcion: 'Personal capacitado' },
    { descripcion: 'Materiales y consumibles' },
  ];
  contracting_contribution: { descripcion: string }[] = [
    { descripcion: 'Disposición del sitio de trabajo' },
    { descripcion: 'Suministro de energía 110V/220V' },
  ];
  contractor_contribution_Quote: String[] = [];
  contracting_contribution_Quote: String[] = [];
  items: Item[] = [];
  totalPrice: number = 0;
  optionsSelected: number = 0;
  construction_company: string = '';
  administration: number = 0;
  unexpected: number = 0;
  utility: number = 0;
  customers: Customer[] = [];
  selectedCustomer: Customer | null = null;
  customerName: String = '';
  filteredCustomers: any[] | undefined;
  deliveryTime: string = '';
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
  clientValid: boolean = false;
  @Input() visible: boolean = false;
  @Input() action: number = 0; // 0: Create, 1: Edit
  @Input() quoteToEdit: Quote | null = null;
  @Output() closeDialog = new EventEmitter<void>();
  @Output() onQuoteCreated = new EventEmitter<void>();
  errorMessage: String = '';
  errorMessagePercent: String = '';

  constructor(
    private quoteService: QuoteService,
    private clientService: ClientService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  verify() {
    this.errorMessage = '';
    if (
      this.selectedCustomer === null ||
      this.selectedCustomer === undefined ||
      !this.selectedCustomer ||
      this.description === '' ||
      this.method_of_payment === ''
    ) {
      this.errorMessage = 'Campo obligatorio';
    }

    if (
      (this.utility === null ||
        this.administration === null ||
        this.unexpected === null) &&
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

    if (
      (this.administration > 100 ||
        this.unexpected > 100 ||
        this.utility > 100) &&
      this.construction_company
    ) {
      this.errorMessagePercent =
        'El porcentaje debe ser un valor entre 1 y 100';
    } else {
      this.errorMessagePercent = '';
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
      if (
        customer.representative?.toLowerCase().indexOf(query.toLowerCase()) == 0
      ) {
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
          post: client.post,
          representative: client.representative,
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

    if (this.errorMessage !== '' || this.errorMessagePercent !== '') {
      this.loading = false;
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
      return this.quoteService.createItem(itemData);
    });

    forkJoin(itemRequests)
      .pipe(
        switchMap((itemResponses) => {
          const itemIds = itemResponses.map((res) => res.item_id);

          const optionData = {
            description: 'Opción para' + this.customerName,
            items: itemIds,
          };

          return this.quoteService.createOption(optionData).pipe(
            switchMap((optionResponse) => {
              const optionId = optionResponse.option_id;

              const quoteData = {
                description: this.description,
                customer_id: this.selectedCustomer?.id,
                options: optionId,
                tasks: this.tasks.map((t) => t.descripcion),
                contracting_materials: this.contracting_contribution.map(
                  (t) => t.descripcion
                ),
                contractor_materials: this.contractor_contribution.map(
                  (t) => t.descripcion
                ),
                iva: this.ivaPercentage,
                administration: this.administration / 100,
                unforeseen: this.unexpected / 100,
                utility: this.utility / 100,
                method_of_payment: this.method_of_payment,
                construction: this.construction_company || null,
                delivery_time: this.deliveryTime,
              };

              return this.quoteService.createQuote(quoteData);
            })
          );
        })
      )
      .subscribe({
        next: (res) => {
          this.onQuoteCreated.emit();
          this.close();
          this.loading = false;
        },
        error: (err) => {
          console.error('Error en el proceso de creación:', err);
          this.loading = false;
        },
      });
  }

  editQuote() {
    this.verify();
    if (this.errorMessage !== '' || this.errorMessagePercent !== '') {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Todos los campos son requeridos',
      });
      return;
    }
    this.loading = true;
    let quoteData: any = {};
    if (
      this.administration !==
      Number(this.quoteToEdit?.administration) * 100
    ) {
      quoteData.administration = this.administration / 100;
    }
    if (this.unexpected !== Number(this.quoteToEdit?.unforeseen) * 100) {
      quoteData.unforeseen = this.unexpected / 100;
    }
    if (this.utility !== Number(this.quoteToEdit?.utility) * 100) {
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

    if (this.contracting_contribution.length > 0) {
      quoteData.contracting_materials = this.contracting_contribution.map(
        (t) => t.descripcion
      );
    }

    if (this.contractor_contribution.length > 0) {
      quoteData.contractor_materials = this.contractor_contribution.map(
        (t) => t.descripcion
      );
    }

    if (this.deliveryTime !== this.quoteToEdit?.delivery_time) {
      quoteData.delivery_time = this.deliveryTime;
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

  addTask() {
    this.tasks.push({ descripcion: '' });
  }

  removeTask(index: number) {
    this.tasks.splice(index, 1);
  }
  addContractorContribution() {
    this.contractor_contribution.push({ descripcion: '' });
  }

  removeContractingContribution(index: number) {
    this.contracting_contribution.splice(index, 1);
  }
  addContractingContribution() {
    this.contracting_contribution.push({ descripcion: '' });
  }

  removeContractorContribution(index: number) {
    this.contractor_contribution.splice(index, 1);
  }

  resetForm() {
    this.actionTittle = 'Crear';
    this.customerName = '';
    this.clientValid = false;
    this.construction_company = '';
    this.administration = 0;
    this.unexpected = 0;
    this.utility = 0;
    this.method_of_payment = '';
    this.description = '';
    this.selectedCustomer = null;
    this.tasks = [{ descripcion: '' }];
    this.contracting_contribution = [
      { descripcion: 'Disposición del sitio de trabajo' },
      { descripcion: 'Suministro de energía 110V/220V' },
    ];
    this.contractor_contribution = [
      { descripcion: 'Elementos de protección personal' },
      { descripcion: 'Herramientas manuales y eléctricas' },
      { descripcion: 'Personal capacitado' },
      { descripcion: 'Materiales y consumibles' },
    ];
    this.tasksQuote = [];
    this.contracting_contribution_Quote = [];
    this.contractor_contribution_Quote = [];
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
    this.errorMessagePercent = '';
  }

  loadEditData() {
    this.actionTittle = 'Editar';
    if (this.quoteToEdit) {
      this.customerName = this.quoteToEdit.customer.name;
      this.description = this.quoteToEdit.description;
      this.administration = this.quoteToEdit.administration * 100;
      this.unexpected = this.quoteToEdit.unforeseen * 100;
      this.utility = this.quoteToEdit.utility * 100;
      this.method_of_payment = this.quoteToEdit.method_of_payment;
      this.construction_company = this.quoteToEdit.construction || '';
      this.ivaPercentage = this.quoteToEdit.iva;
      this.selectedCustomer = this.quoteToEdit.customer;
      this.tasks = this.quoteToEdit.tasks.map((t) => ({ descripcion: t }));
      this.contracting_contribution =
        this.quoteToEdit.contracting_materials.map((t) => ({
          descripcion: t || '',
        }));
      this.contractor_contribution = this.quoteToEdit.contractor_materials.map(
        (t) => ({ descripcion: t || '' })
      );
      this.deliveryTime = this.quoteToEdit.delivery_time;
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

  getUnitValue(unit: string): string {
    const unitMap: { [key: string]: string } = {
      Metros: 'm',
      Centímetros: 'cm',
      Milímetros: 'mm',
      Kilómetros: 'km',
      Pulgadas: 'in',
      'Metros cuadrados (m2)': 'm2',
      'Centímetros cuadrados (cm2)': 'cm2',
      'Metros cubicos (m3)': 'm3',
      'Centímetros (cm3)': 'cm3',
      'Metro Lineal (ml)': 'ml',
      Pies: 'ft',
      Kilogramos: 'kg',
      Gramos: 'g',
      Miligramos: 'mg',
      Libras: 'lb',
      Toneladas: 't',
      Litros: 'L',
      Mililitros: 'mL',
      Galones: 'gal',
      Unidades: 'u',
      Docenas: 'dz',
      Cajas: 'caja',
      Pares: 'par',
    };

    return unitMap[unit] ?? 'unknown';
  }

  validatePercent() {
    if (
      this.administration > 100 ||
      this.utility > 100 ||
      this.unexpected > 100
    ) {
      this.errorMessagePercent = 'El valor debe ser entre 1 y 100';
    } else {
      this.errorMessagePercent = '';
    }
  }

  onCustomerChange() {
    if (this.selectedCustomer && this.selectedCustomer.id !== undefined) {
      this.clientValid = true;
      this.customerName = this.selectedCustomer.name;
    } else {
      this.clientValid = false;
    }
  }

  confirmationClose() {
    this.confirmationService.confirm({
      message:
        '¿Está seguro que desea cerrar el formulario? Los cambios se perderán',
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
        this.close();
      },
    });
  }
}
