import { Injectable } from '@angular/core';
import { BaseHttpService } from '../../shared/data_access/base_http.service';
import { Observable, tap } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class ToolService extends BaseHttpService {

  headers: HttpHeaders;
  
    constructor(private cookieService: CookieService) {
      super();
      this.headers = new HttpHeaders({
        'Authorization': `Token ${this.cookieService.get('token')}`
      });
    }

  addTool(name: string, marca: string, image: File): Observable<any> {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('image', image);
    formData.append('marca', marca);

    return this.http.post(`${this.apiUrl}tool/addtool/`, formData, { headers: this.headers }).pipe(
      tap((response: any) => {
      })
    );
  }

  getTool(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}tool/gettool/${id}`).pipe(
      tap((response: any) => {
      }
    ));
    }

  getTools(): Observable<any> {
    return this.http.get(`${this.apiUrl}tool/gettools`).pipe(
      tap((response: any) => {
      })
    );
  }

  ngOnInit() {
    this.getTools();
  }

  updateTool(id: number, formData: FormData): Observable<any> {
    return this.http.patch(`${this.apiUrl}tool/updatetool/`, formData, { headers: this.headers }).pipe(
      tap((response: any) => {
      })
    );
  }
  
  


  deleteTool(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}tool/delete/${id}`, { headers: this.headers }).pipe(
      tap((response: any) => {
      })
    );
  }

}
