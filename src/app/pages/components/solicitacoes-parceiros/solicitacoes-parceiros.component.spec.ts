import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitacoesParceirosComponent } from './solicitacoes-parceiros.component';

describe('SolicitacoesParceirosComponent', () => {
  let component: SolicitacoesParceirosComponent;
  let fixture: ComponentFixture<SolicitacoesParceirosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitacoesParceirosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolicitacoesParceirosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
