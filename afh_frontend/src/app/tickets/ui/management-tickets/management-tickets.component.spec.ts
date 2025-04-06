import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagementTicketsComponent } from './management-tickets.component';

describe('ManagementTicketsComponent', () => {
  let component: ManagementTicketsComponent;
  let fixture: ComponentFixture<ManagementTicketsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagementTicketsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagementTicketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
