import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewOrdersWorkComponent } from './view-orders-work.component';

describe('ViewOrdersWorkComponent', () => {
  let component: ViewOrdersWorkComponent;
  let fixture: ComponentFixture<ViewOrdersWorkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewOrdersWorkComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewOrdersWorkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
