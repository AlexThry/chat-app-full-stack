import { Routes } from '@angular/router';
import {InscriptionComponent} from "./inscription/inscription.component";
import {LoginComponent} from "./login/login.component";
import {ChatComponent} from "./chat/chat.component";
import {ConversationsComponent} from "./conversations/conversations.component";
import {DashboardComponent} from "./dashboard/dashboard.component";
import {UserPageComponent} from "./user-page/user-page.component";

export const routes: Routes = [
    { path: 'signup', component: InscriptionComponent },
    { path: '', component: LoginComponent },
    { path: 'chat/:id', component: DashboardComponent },
    { path: 'chat', component: DashboardComponent },
    { path: 'user/:id', component: UserPageComponent },
];
