import { Injectable } from "@angular/core";
import { BaseHttpService } from "../../shared/data_access/base_http.service";
import { CookieService } from "ngx-cookie-service";
import { Observable, forkJoin } from "rxjs";
import { map } from "rxjs/operators";
import { FinanceService } from "../../finance/services/finance.service";
import { progressOrderService } from "../../order_works/services/progress_work.service";
import { ToolService } from "../../tools/services/tool.service";

@Injectable({
  providedIn: 'root',
})
export class HomeService extends BaseHttpService {
  constructor(
    private cookieService: CookieService,
    private financeService: FinanceService,
    private progressService: progressOrderService,
    private toolService: ToolService
  ) {
    super();
  }

  getHomeData(): Observable<any> {
    return forkJoin({
      accounts: this.financeService.getAccounts(),
      workProgress: this.progressService.getProgress(),
      tools: this.toolService.getTools()
    }).pipe(
      map(data => this.processHomeData(data))
    );
  }

  private processHomeData(data: any): any {
    const accounts = data.accounts || [];
    const workProgress = data.workProgress || [];
    const tools = data.tools || [];

    return {
      accounts: accounts.map((account: any) => ({
        id: account.id,
        name: account.name,
        type: account.type_display,
        balance: account.initial_amount,
        balanceFormatted: account.initial_amount_formatted
      })),
      workProgress: workProgress.map((progress: any) => ({
        id: progress.id,
        workOrder: progress.work_order,
        progressPercentage: progress.progress_percentage,
        state: progress.state,
        description: progress.work_order?.description || 'Sin descripción'
      })),
      tools: tools
        .filter((tool: any) => tool.state === 3) // Solo herramientas en estado 1
        .map((tool: any) => ({
          id: tool.id,
          name: tool.name,
          code: tool.code,
          marca: tool.marca,
          image: tool.image,
          state: tool.state
        }))
    };
  }
}