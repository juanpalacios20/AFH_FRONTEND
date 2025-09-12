import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCostsComponent } from './view-costs.component';

describe('ViewCostsComponent', () => {
  let component: ViewCostsComponent;
  let fixture: ComponentFixture<ViewCostsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewCostsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewCostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
