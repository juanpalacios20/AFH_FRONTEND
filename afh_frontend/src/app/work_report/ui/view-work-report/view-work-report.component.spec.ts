import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewWorkReportComponent } from './view-work-report.component';

describe('ViewWorkReportComponent', () => {
  let component: ViewWorkReportComponent;
  let fixture: ComponentFixture<ViewWorkReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewWorkReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewWorkReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
