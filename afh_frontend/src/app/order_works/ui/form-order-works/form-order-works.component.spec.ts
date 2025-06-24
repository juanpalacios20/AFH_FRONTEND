import { ComponentFixture, TestBed } from '@angular/core/testing';

import  FormOrderWorksComponent  from './form-order-works.component';

describe('FormOrderWorksComponent', () => {
  let component: FormOrderWorksComponent;
  let fixture: ComponentFixture<FormOrderWorksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormOrderWorksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormOrderWorksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
