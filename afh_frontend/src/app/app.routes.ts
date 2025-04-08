import { Routes } from '@angular/router';
import { LoginComponent } from './auth/ui/login/login.component';
import { SendCodeComponent } from './auth/ui/send-code/send-code.component';
import { ValidationCodeComponent } from './auth/ui/validation-code/validation-code.component';
import  ManagementToolsComponent  from './tools/ui/management-tools/management-tools.component';
import { MenuComponent } from './shared/ui/menu/menu.component';
import { AuthGuard } from './shared/auth/data_access/auth.guard';
import { TokenGuard } from './shared/auth/data_access/token.guard';
import { ChangePasswordComponent } from './auth/ui/change-password/change-password.component';
import { ManagementTicketsComponent } from './tickets/ui/management-tickets/management-tickets.component';
import { HistoryTicketsComponent } from './tickets/ui/history-tickets/history-tickets.component';
import { CreateTicketNoAdminComponent } from './tickets/ui/create-ticket-no-admin/create-ticket-no-admin.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'send-code', component: SendCodeComponent },
    { path: 'validation-code', component: ValidationCodeComponent, canActivate: [TokenGuard] },
    { path: 'change-password', component: ChangePasswordComponent, canActivate: [TokenGuard] },
    { path: 'management-tools', component: ManagementToolsComponent, canActivate: [AuthGuard] },
    { path: 'management-tickets', component: ManagementTicketsComponent, canActivate: [AuthGuard] },
    { path: 'history-tickets', component: HistoryTicketsComponent, canActivate: [AuthGuard] },
    { path: 'create-tickets', component: CreateTicketNoAdminComponent, canActivate: [AuthGuard] },
    { path: 'management-vales', component: ManagementTicketsComponent, canActivate: [AuthGuard] },
    { path: 'history-vales', component: ManagementTicketsComponent, canActivate: [AuthGuard] },
    { path: 'menu', component: MenuComponent },
    { path: 'change-password', component: ChangePasswordComponent },
    { path: '**', redirectTo: 'login' }

];
