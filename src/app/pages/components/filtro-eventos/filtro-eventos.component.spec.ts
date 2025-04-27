import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltroEventosComponent } from './filtro-eventos.component';

describe('FiltroEventosComponent', () => {
  let component: FiltroEventosComponent;
  let fixture: ComponentFixture<FiltroEventosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiltroEventosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FiltroEventosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
