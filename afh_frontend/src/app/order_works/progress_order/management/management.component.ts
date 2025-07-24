import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import FormOrderWorksComponent from '../../ui/form-order-works/form-order-works.component';
import ViewOrdersWorkComponent from '../../ui/view-orders-work/view-orders-work.component';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MenuComponent } from '../../../shared/ui/menu/menu.component';
import { ButtonModule } from 'primeng/button';
import { workProgressOrder } from '../../../interfaces/models';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-management',
  imports: [
    ButtonModule,
    MenuComponent,
    InputIconModule,
    IconFieldModule,
    InputTextModule,
    FloatLabelModule,
    FormsModule,
    ToastModule,
    TableModule,
    TagModule,
    NgIf,
  ],
  templateUrl: './management.component.html',
  styleUrl: './management.component.css',
  providers: [ConfirmationService, MessageService],
})
export default class ProgressManagementComponent {
  workProgressOrder: workProgressOrder[] = [];
  loadingworkProgressOrder: boolean = false;
  workProgressOrderFound: string = '';
}
