import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagementToolsComponent } from './management-tools.component';

describe('ManagementToolsComponent', () => {
  let component: ManagementToolsComponent;
  let fixture: ComponentFixture<ManagementToolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagementToolsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagementToolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
