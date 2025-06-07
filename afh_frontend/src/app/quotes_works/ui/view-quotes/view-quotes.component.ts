import { CommonModule, NgFor } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';

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



@Component({
  selector: 'app-view-quotes',
  imports: [Dialog, ButtonModule, TagModule, NgFor, CommonModule],
  templateUrl: './view-quotes.component.html',
  styleUrl: './view-quotes.component.css'
})
export default class ViewQuotesComponent {
  @Input() quote: Quote | null = null;
  @Input() state: string = '';
  @Input() severity: | 'success'
    | 'warn'
    | 'danger'
    | 'secondary'
    | 'info'
    | 'contrast'
    | undefined = 'info';
  @Input() visible: boolean = false;
  @Output() closeDialog = new EventEmitter<void>();

  showDialog() {
    this.visible = true;
  }
  
  close() {
    this.visible = false;
    this.closeDialog.emit();
  }
}
