import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CadastreSeComponent } from './pages/cadastre-se/cadastre-se.component';
import { LoginComponent } from './pages/login/login.component';
import { PublicProfileComponent } from './pages/public-profile/public-profile.component';
import { DivulgarEventoComponent } from './pages/components/divulgar-evento/divulgar-evento.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'cadastre-se', component: CadastreSeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'profile/usuario/id', component: PublicProfileComponent },
  { path: 'divulgarEvento', component: DivulgarEventoComponent },
];
