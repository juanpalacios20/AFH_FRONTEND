import { Component } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { GlobalService } from '../../../global.service';
import { LocalStorageService } from '../../../localstorage.service';
import { ViewToolComponent } from '../../../tools/ui/view-tool/view-tool.component';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { MenuComponent } from '../../../shared/ui/menu/menu.component';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { RatingModule } from 'primeng/rating';
import { CommonModule } from '@angular/common';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { FormsModule } from '@angular/forms';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ToolsMaintenance } from '../../../interfaces/models';

@Component({
  selector: 'app-tools-maintenance',
  imports: [
      ButtonModule,
      RippleModule,
      MenuComponent,
      TableModule,
      TagModule,
      RatingModule,
      CommonModule,
      InputIconModule,
      IconFieldModule,
      InputTextModule,
      FloatLabelModule,
      FormsModule,
      ConfirmDialog,
      ToastModule
    ],
  templateUrl: './tools-maintenance.component.html',
  styleUrl: './tools-maintenance.component.css',
  providers: [ConfirmationService, MessageService],
})
export default class ToolsMaintenanceComponent {
  loadingTools: boolean = false;
  tools: ToolsMaintenance[] = [];
constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private globalService: GlobalService,
    private localStorageService: LocalStorageService
  ) {
    this.globalService.changeTitle('AFH: Herramientas en mantenimiento');
  }
}
