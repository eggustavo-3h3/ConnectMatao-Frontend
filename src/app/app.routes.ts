import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CadastreSeComponent } from './pages/cadastre-se/cadastre-se.component';
import { LoginComponent } from './pages/login/login.component';
import { PublicProfileComponent } from './pages/public-profile/public-profile.component';
import { DivulgarEventoComponent } from './pages/components/divulgar-evento/divulgar-evento.component';
import { CardEventoDetalhesComponent } from './pages/components/card-evento-detalhes/card-evento-detalhes.component';
import { AlterarSenhaComponent } from './pages/alterar-senha/alterar-senha.component';
import { RecuperarSenhaComponent } from './pages/recuperar-senha/recuperar-senha.component';
import { SolicitacoesParceirosComponent } from './pages/components/solicitacoes-parceiros/solicitacoes-parceiros.component';
import { AccessDeniedComponent } from './pages/components/access-denied/access-denied.component';

import { authGuard } from './guards/auth.guard';
import { Perfil } from './enums/perfil.enum';
import { ResetarSenhaComponent } from './pages/resetar-senha/resetar-senha.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'cadastre-se', component: CadastreSeComponent },
  { path: 'recuperar-senha/:p', component: RecuperarSenhaComponent },
  { path: 'detalhe-evento/:eventId', component: CardEventoDetalhesComponent },
  { path: 'acesso-negado', component: AccessDeniedComponent },
  { path: 'reset-senha/:chave-reset', component: ResetarSenhaComponent },
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'eventos/pesquisa',
    component: HomeComponent,
  },

  {
    path: 'alterar-senha',
    component: AlterarSenhaComponent,
    canActivate: [authGuard],
  },
  {
    path: 'profile/usuario/:id',
    component: PublicProfileComponent,
  },
  {
    path: 'perfil/:id',
    component: PublicProfileComponent,
  },
  {
    path: 'divulgarEvento',
    component: DivulgarEventoComponent,
    canActivate: [authGuard],
    data: { roles: [Perfil.Parceiro, Perfil.Administrador] },
  },
  {
    path: 'solicitacoes-parceiros',
    component: SolicitacoesParceirosComponent,
    canActivate: [authGuard],
    data: { roles: [Perfil.Administrador] },
  },

  {
    path: 'eventos/pesquisa',
    component: HomeComponent,
  },

  { path: '**', redirectTo: '' },
];
