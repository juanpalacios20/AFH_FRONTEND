import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormAdvanceComponent } from './form-advance.component';

describe('FormAdvanceComponent', () => {
  let component: FormAdvanceComponent;
  let fixture: ComponentFixture<FormAdvanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormAdvanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormAdvanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
