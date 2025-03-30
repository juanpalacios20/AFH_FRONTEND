import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidationCodeComponent } from './validation-code.component';

describe('ValidationCodeComponent', () => {
  let component: ValidationCodeComponent;
  let fixture: ComponentFixture<ValidationCodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidationCodeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValidationCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
