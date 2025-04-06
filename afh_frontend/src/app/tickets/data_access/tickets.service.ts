import { Injectable } from "@angular/core";
import { BaseHttpService } from "../../shared/data_access/base_http.service";


@Injectable({
    providedIn: 'root',
  })
export class TicketsService extends BaseHttpService {
}