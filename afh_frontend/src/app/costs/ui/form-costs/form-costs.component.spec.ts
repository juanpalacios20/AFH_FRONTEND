import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormCostsComponent } from './form-costs.component';

describe('FormCostsComponent', () => {
  let component: FormCostsComponent;
  let fixture: ComponentFixture<FormCostsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormCostsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormCostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
