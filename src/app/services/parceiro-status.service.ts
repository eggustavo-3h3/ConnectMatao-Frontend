import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ParceiroStatusService {
  private apiUrl = 'https://connectmatao-api.tccnapratica.com.br/parceiro';

  private partnerStatusCache = new Map<string, boolean>();

  constructor(private http: HttpClient) {}

  isUserApprovedPartner(userId: string): Observable<boolean> {
    if (!userId) {
      console.warn(
        'ParceiroStatusService: userId é nulo ou vazio. Retornando false.'
      );
      return of(false);
    }

    if (this.partnerStatusCache.has(userId)) {
      console.log(
        `ParceiroStatusService: Retornando status de parceiro do cache para o usuário ${userId}.`
      );
      return of(this.partnerStatusCache.get(userId)!);
    }

    console.log(
      `ParceiroStatusService: Chamando API para verificar status de parceiro para o usuário ${userId} em ${this.apiUrl}/status/${userId}.`
    );

    return this.http
      .get<{ userId: string; isPartner: boolean }>(
        `${this.apiUrl}/status/${userId}`
      )
      .pipe(
        map((response) => response.isPartner),
        tap((isPartner) => {
          console.log(
            `ParceiroStatusService: Status de parceiro recebido para ${userId}: ${isPartner}.`
          );
          this.partnerStatusCache.set(userId, isPartner);
        }),
        catchError((error) => {
          console.error(
            `Erro na API ao verificar status de parceiro para o usuário ${userId}:`,
            error
          );
          this.partnerStatusCache.set(userId, false);
          return of(false);
        }),
        shareReplay(1)
      );
  }

  getCachedStatus(userId: string): boolean {
    return this.partnerStatusCache.get(userId) || false;
  }

  clearCache(): void {
    this.partnerStatusCache.clear();
  }
}
