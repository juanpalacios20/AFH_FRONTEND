import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagementOrdersWorksComponent } from './management-orders-works.component';

describe('ManagementOrdersWorksComponent', () => {
  let component: ManagementOrdersWorksComponent;
  let fixture: ComponentFixture<ManagementOrdersWorksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagementOrdersWorksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagementOrdersWorksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
