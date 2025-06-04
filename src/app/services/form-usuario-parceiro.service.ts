import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IParceiro } from '../interfaces/parceiro.interface';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class FormUsuarioParceiroService {
  private apiUrl = 'https://connectmatao-api.tccnapratica.com.br/parceiro';

  constructor(private http: HttpClient, private authService: AuthService) {}

  submitPartnerForm(partnerData: {
    nomeCompleto: string;
    cpf: string;
    telefone: string;
  }): Observable<any> {
    const headers = this.authService.createAuthHeader();
    const payload = {
      nomeCompleto: partnerData.nomeCompleto,
      cpf: partnerData.cpf,
      telefone: partnerData.telefone,
    };
    return this.http.put(`${this.apiUrl}/completar-cadastro`, payload, {
      headers,
    });
  }

  getPendingPartnerApplications(): Observable<IParceiro[]> {
    const headers = this.authService.createAuthHeader();
    return this.http.get<IParceiro[]>(`${this.apiUrl}/pendentes`, { headers });
  }

  approvePartner(id: string): Observable<any> {
    const headers = this.authService.createAuthHeader();
    return this.http.put(`${this.apiUrl}/aprovar/${id}`, null, { headers });
  }

  rejectPartner(id: string): Observable<any> {
    const headers = this.authService.createAuthHeader();
    return this.http.put(`${this.apiUrl}/reprovar/${id}`, null, { headers });
  }

  getLoggedUserPartnerStatus(): Observable<{
    nomeCompleto: string;
    cpf: string;
    telefone: string;
    flagAprovadoParceiro: boolean | null;
    formParceiroExiste: boolean;
  }> {
    const headers = this.authService.createAuthHeader();
    return this.http.get<{
      nomeCompleto: string;
      cpf: string;
      telefone: string;
      flagAprovadoParceiro: boolean | null;
      formParceiroExiste: boolean;
    }>(`${this.apiUrl}/status-cadastro`, { headers });
  }
}
