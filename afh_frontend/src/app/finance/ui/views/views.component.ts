import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { account, expense, income } from '../../../interfaces/models';
import { Dialog } from 'primeng/dialog';

@Component({
  selector: 'app-views',
  imports: [NgIf, Dialog, DatePipe],
  templateUrl: './views.component.html',
  styleUrl: './views.component.css',
})
export default class ViewsComponent {
  @Input() visibleIncome: boolean = false;
  @Input() visibleExpense: boolean = false;
  @Input() visibleAccount: boolean = false;
  @Input() income?: income;
  @Input() expense?: expense;
  @Input() account?: account;
  @Input() type: string = '';
  @Output() closeDialog = new EventEmitter<void>();
  visible: boolean = false;

  close() {
    this.visibleIncome = false;
    this.visibleExpense = false;
    this.visibleAccount = false;
    this.closeDialog.emit();
  }

  ngOnChanges() {
    if (this.visibleIncome) {
      this.visible = true;
    }
    if (this.visibleExpense) {
      this.visible = true; 
    }
    if (this.visibleAccount) {
      this.visible = true; 
    }
  }
}
