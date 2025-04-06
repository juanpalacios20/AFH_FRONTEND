import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryTicketsComponent } from './history-tickets.component';

describe('HistoryTicketsComponent', () => {
  let component: HistoryTicketsComponent;
  let fixture: ComponentFixture<HistoryTicketsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryTicketsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoryTicketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
