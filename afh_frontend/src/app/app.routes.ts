import { Routes } from '@angular/router';
import { LoginComponent } from './auth/ui/login/login.component';
import { SendCodeComponent } from './auth/ui/send-code/send-code.component';
import { ValidationCodeComponent } from './auth/ui/validation-code/validation-code.component';
import ManagementToolsComponent from './tools/ui/management-tools/management-tools.component';
import { MenuComponent } from './shared/ui/menu/menu.component';
import { AuthGuard } from './shared/auth/data_access/auth.guard';
import { TokenGuard } from './shared/auth/data_access/token.guard';
import { ChangePasswordComponent } from './auth/ui/change-password/change-password.component';
import { ManagementTicketsComponent } from './tickets/ui/management-tickets/management-tickets.component';
import { HistoryTicketsComponent } from './tickets/ui/history-tickets/history-tickets.component';
import { AdminGuard } from './shared/auth/data_access/admin.guard';
import ClientsComponent from './clients/ui/clients/clients.component';
import QuotesComponent from './quotes_works/ui/quotes/quotes.component';
import ManagementOrdersWorksComponent from './order_works/ui/management-orders-works/management-orders-works.component';
import WorkReportComponent from './work_report/ui/work-report/work-report.component';
import ManagementComponent from './finance/ui/management/management.component';
import ReportsComponent from './finance/ui/reports/reports.component';
import ChatComponent from './ai/ui/chat/chat.component';
import ProgressManagementComponent from './order_works/progress_order/management/management.component';
import ProgressInfoComponent from './order_works/progress_order/progress-info/progress-info.component';
import { FormAdvanceComponent } from './order_works/work_advance/form-advance/form-advance.component';
import { LoginCustomerComponent } from './customer/ui/login/login-customer/login-customer.component';
import { HomeWorkCustomerComponent } from './customer/ui/home-work-customer/home-work-customer.component';
import { AdvancesComponent } from './customer/ui/advances/advances.component';
import ToolsMaintenanceComponent from './tools_maintenance/ui/tools-maintenance/tools-maintenance.component';
import { HomeComponent } from './home/ui/home/home.component';
import ManagementCostsComponent from './costs/ui/management-costs/management-costs.component';


export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [AdminGuard] },
  {
    path: 'send-code',
    component: SendCodeComponent,
    canActivate: [AdminGuard],
  },
  {
    path: 'validation-code',
    component: ValidationCodeComponent,
    canActivate: [TokenGuard],
  },
  {
    path: 'change-password',
    component: ChangePasswordComponent,
  },
  {
    path: 'management-tools',
    component: ManagementToolsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'management-tools-maintenance',
    component: ToolsMaintenanceComponent,
  },
  {
    path: 'management-tickets',
    component: ManagementTicketsComponent,
    canActivate: [AuthGuard],
  },
  { path: 'clients', component: ClientsComponent, canActivate: [AuthGuard] },
  {
    path: 'history-tickets',
    component: HistoryTicketsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'management-vales',
    component: ManagementTicketsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'history-vales',
    component: HistoryTicketsComponent,
    canActivate: [AuthGuard],
  },
  { path: 'menu', component: MenuComponent },
  { path: 'change-password', component: ChangePasswordComponent },
  { path: 'quotes', component: QuotesComponent, canActivate: [AuthGuard] },
  {
    path: 'management-orders-works',
    component: ManagementOrdersWorksComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'work-report',
    component: WorkReportComponent,
    canActivate: [AuthGuard],
  },
  { path: 'finance', component: ManagementComponent, canActivate: [AuthGuard] },
  { path: 'reports', component: ReportsComponent, canActivate: [AuthGuard] },
  { path: 'agenteai', component: ChatComponent, canActivate: [AuthGuard] },
  { path: 'login-customer', component: LoginCustomerComponent },
  { path: 'home-customer', component: HomeWorkCustomerComponent, canActivate: [AuthGuard] },
  { path: 'work-advances', component: AdvancesComponent },
  {
    path: 'progressOrder',
    component: ProgressManagementComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'progressOrder/info/:id',
    component: ProgressInfoComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'progressOrder/info/create/:id',
    component: FormAdvanceComponent,
    canActivate: [AuthGuard],
  },
  { path: 'home', 
    component: HomeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'management-costs',
    component: ManagementCostsComponent,
    canActivate: [AuthGuard],
  },
  { path: '**', redirectTo: 'login' },
];
