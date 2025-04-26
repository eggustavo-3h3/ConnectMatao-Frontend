import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DivulgarEventoComponent } from './divulgar-evento.component';

describe('DivulgarEventoComponent', () => {
  let component: DivulgarEventoComponent;
  let fixture: ComponentFixture<DivulgarEventoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DivulgarEventoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DivulgarEventoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
