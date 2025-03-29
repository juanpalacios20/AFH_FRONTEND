import { Routes } from '@angular/router';
import { LoginComponent } from './auth/ui/login/login.component';
import { SendCodeComponent } from './auth/ui/send-code/send-code.component';
import { ValidationCodeComponent } from './auth/ui/validation-code/validation-code.component';
import { ManagementToolsComponent } from './tools/ui/management-tools/management-tools.component';
import { MenuComponent } from './shared/ui/menu/menu.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'send-code', component: SendCodeComponent },
    { path: 'validation-code', component: ValidationCodeComponent },
    { path: 'management-tools', component: ManagementToolsComponent },
    { path: 'menu', component: MenuComponent },
    { path: '**', redirectTo: 'login' }

];
