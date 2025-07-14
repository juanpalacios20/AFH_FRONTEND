import { Component } from '@angular/core';
import { AIService } from '../../services/ai.service';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { MenuComponent } from '../../../shared/ui/menu/menu.component';

@Component({
  selector: 'app-chat',
  imports: [FloatLabelModule, InputTextModule, FormsModule, MenuComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export default class ChatComponent {
  email: string = '';
  constructor(private aiService: AIService) {}
}
