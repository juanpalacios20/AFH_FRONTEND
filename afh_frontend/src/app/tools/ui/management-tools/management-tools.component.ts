import { Component} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { MenuComponent } from '../../../shared/ui/menu/menu.component';

@Component({
  selector: 'app-management-tools',
  standalone: true,
  imports: [ButtonModule, RippleModule, MenuComponent],
  templateUrl: './management-tools.component.html',
  styleUrl: './management-tools.component.css',
})
export class ManagementToolsComponent {

}
