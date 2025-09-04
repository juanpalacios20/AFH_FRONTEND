import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolsMaintenanceComponent } from './tools-maintenance.component';

describe('ToolsMaintenanceComponent', () => {
  let component: ToolsMaintenanceComponent;
  let fixture: ComponentFixture<ToolsMaintenanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToolsMaintenanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToolsMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
