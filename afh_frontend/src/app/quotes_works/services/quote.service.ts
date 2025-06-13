import { Injectable, ListenerOptions } from '@angular/core';
import { BaseHttpService } from '../../shared/data_access/base_http.service';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class QuoteService extends BaseHttpService {
  constructor(private cookieService: CookieService) {
    super();
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Token ${this.cookieService.get('token')}`,
    });
  }

  getQuotes() {
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.apiUrl}/quote/getquotes/`, { headers });
  }

  createItem(item: any) {
    const headers = this.getHeaders();
    return this.http.post<any>(`${this.apiUrl}/item/additem/`, item, {
      headers,
    });
  }

  createOption(option: any) {
    const headers = this.getHeaders();
    return this.http.post<any>(`${this.apiUrl}/option/addoption/`, option, {
      headers,
    });
  }

  createQuote(quote: any) {
    const headers = this.getHeaders();
    return this.http.post<any>(`${this.apiUrl}/quote/addquote/`, quote, {
      headers,
    });
  }

  deleteQuote(quoteId: number) {
    const headers = this.getHeaders();
    return this.http.delete<any>(`${this.apiUrl}/quote/delete/${quoteId}`, {
      headers,
    });
  }

  getOptions() {
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.apiUrl}/option/getoptions/`, {
      headers,
    });
  }

  getQuoteById(quoteId: number) {
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.apiUrl}/quote/getquote/${quoteId}`, {
      headers,
    });
  }

  getItemById(itemId: number) {
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.apiUrl}/item/getitem/${itemId}`, {
      headers,
    });
  }

  updateQuote(quoteId: number, quoteData: any) {
    const headers = this.getHeaders();
    return this.http.put<any>(
      `${this.apiUrl}/quote/updatequote/${quoteId}`,
      quoteData,
      { headers }
    );
  }

  updateOption(optionId: number, optionData: any) {
    const headers = this.getHeaders();
    return this.http.put<any>(
      `${this.apiUrl}/option/updateoption/${optionId}`,
      optionData
    );
  }

  updateItem(itemId: number, itemData: any) {
    const headers = this.getHeaders();
    console.log('id del item a actualizar', itemId);
    return this.http.put<any>(
      `${this.apiUrl}/item/updateitem/${itemId}`,
      itemData,
      { headers }
    );
  }

  deleteItem(itemId: number) {
    const headers = this.getHeaders();
    return this.http.delete<any>(`${this.apiUrl}/item/delete/${itemId}`);
  }

  deleteItems(listItems: number[]) {
    for (let index = 0; index < listItems.length; index++) {
      const item = listItems[index];
      this.deleteItem(item);
    }
    return;
  }

  deleteOption(optionId: number) {
    console.log(optionId);
    return this.http
      .delete<any>(`${this.apiUrl}/option/delete/${optionId}`)
      .subscribe({
        next: (response) => {
          console.log('opcion eliminada');
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  deleteOptions(listOptions: number[]) {
    for (let index = 0; index < listOptions.length; index++) {
      const option = listOptions[index];
      this.deleteOption(option);
    }
    console.log(listOptions);
  }

  itemToOption(optionId: number, itemsData: any) {
    const headers = this.getHeaders();
    return this.http
      .patch<any>(
        `${this.apiUrl}/option/additemtooption/${optionId}`,
        itemsData,
        { headers }
      )
      .subscribe({
        next: (response) => {
          console.log('epa, funciono', response);
        },
        error: (err) => {
          console.log('error al crear nuevo item', err);
        },
      });
  }

  optionToQuote(quoteId: number, optionsData: any) {
    const headers = this.getHeaders();
    return this.http
      .patch<any>(
        `${this.apiUrl}/quote/addoptiontoquote/${quoteId}`,
        optionsData,
        { headers }
      )
      .subscribe({
        next: (response) => {
          console.log('epa, funciono tambien', response);
        },
        error: (err) => {
          console.log('error al crear nueva opcion', err);
        },
      });
  }

  getPDF(quoteId: number): Observable<HttpResponse<Blob>> {
    const headers = this.getHeaders();
    console.log('id de la cotizacion', quoteId);
    return this.http.get(`${this.apiUrl}quote/pdf/${quoteId}`, {
      headers: headers,
      observe: 'response',
      responseType: 'blob',
    });
  }

  changeState(quoteId: number, data: any) {
    const headers = this.getHeaders();
    return this.http
      .patch(`${this.apiUrl}quote/changestate/${quoteId}`, data, { headers })
      .subscribe({
        next: (response) => {
          console.log('exito', response);
        },
        error: (err) => {
          console.log('error', err);
        },
      });
  }
}
