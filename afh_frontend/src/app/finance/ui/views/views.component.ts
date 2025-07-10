import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { expense, income } from '../../../interfaces/models';
import { Dialog } from 'primeng/dialog';

@Component({
  selector: 'app-views',
  imports: [NgIf, Dialog],
  templateUrl: './views.component.html',
  styleUrl: './views.component.css',
})
export default class ViewsComponent {
  @Input() visibleIncome: boolean = false;
  @Input() visibleExpense: boolean = false;
  @Input() income?: income;
  @Input() expense?: expense;
  @Input() type: string = '';
  @Output() closeDialog = new EventEmitter<void>();
  visible: boolean = false;

  account(): string {
    const account =
      this.type === 'ingreso'
        ? this.income?.destination_account
        : this.expense?.origin_account;
    if (account === 1) {
      return 'CUENTA BANCARIA';
    }
    if (account === 2) {
      return 'CAJA PRINCIPAL';
    }
    return 'No se encontro la cuenta';
  }

  close() {
    this.visibleIncome = false;
    this.visibleExpense = false;
    this.closeDialog.emit();
  }

  ngOnChanges() {
    if (this.visibleIncome) {
      this.visible = true;
    }
    if (this.visibleExpense) {
      this.visible = true;
    }
    console.log(this.income);
    console.log(this.visible);
  }
}
