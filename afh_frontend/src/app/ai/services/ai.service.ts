import { Injectable } from "@angular/core";
import { BaseHttpService } from "../../shared/data_access/base_http.service";
import { environment } from "../../environments/environment.development";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable({
  providedIn: 'root',
})
export class AIService extends BaseHttpService {
  private readonly GEMINI_API_URL =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${environment.API_KEY}`;

  sendPrompt(prompt: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    const body = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: `Responde como un asistente conversacional en una sola respuesta clara:\n\n${prompt}` }
          ]
        }
      ]
    };

    return this.http.post(this.GEMINI_API_URL, body, { headers });
  }
}
