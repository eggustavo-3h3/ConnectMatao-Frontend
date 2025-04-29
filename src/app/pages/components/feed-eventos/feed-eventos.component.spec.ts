import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedEventosComponent } from './feed-eventos.component';

describe('FeedEventosComponent', () => {
  let component: FeedEventosComponent;
  let fixture: ComponentFixture<FeedEventosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedEventosComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FeedEventosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
