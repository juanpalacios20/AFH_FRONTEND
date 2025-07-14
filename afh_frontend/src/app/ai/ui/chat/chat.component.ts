import { Component } from '@angular/core';
import { AIService } from '../../services/ai.service';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { MenuComponent } from '../../../shared/ui/menu/menu.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat',
  imports: [FloatLabelModule, InputTextModule, FormsModule, MenuComponent, CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export default class ChatComponent {
  messages: { role: 'user' | 'ai'; content: string }[] = [];
  userInput: string = '';

  constructor(private aiService: AIService) {}

  sendMessage() {
    if (!this.userInput.trim()) return;

    const userMessage = this.userInput;
    this.messages.push({ role: 'user', content: userMessage });
    this.userInput = '';

    this.aiService.sendPrompt(userMessage).subscribe({
      next: (response: { candidates?: { content?: { parts?: { text?: string }[] } }[] } ) => {
        const aiResponse = response?.candidates?.[0]?.content?.parts?.[0]?.text || 'Error al procesar';
        this.messages.push({ role: 'ai', content: aiResponse });
      },
      error: () => {
        this.messages.push({ role: 'ai', content: 'Ocurrió un error al conectarse con Gemini' });
      }
    });
  }
}
