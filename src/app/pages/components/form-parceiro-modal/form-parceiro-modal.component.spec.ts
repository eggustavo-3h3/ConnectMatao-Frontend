import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormParceiroModalComponent } from './form-parceiro-modal.component';

describe('FormParceiroModalComponent', () => {
  let component: FormParceiroModalComponent;
  let fixture: ComponentFixture<FormParceiroModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormParceiroModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormParceiroModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
