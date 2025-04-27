import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardEventoDetalhesComponent } from './card-evento-detalhes.component';

describe('CardEventoDetalhesComponent', () => {
  let component: CardEventoDetalhesComponent;
  let fixture: ComponentFixture<CardEventoDetalhesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardEventoDetalhesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardEventoDetalhesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
