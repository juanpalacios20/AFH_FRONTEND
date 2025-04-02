import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateToolsComponent } from './create-tools.component';

describe('CreateToolsComponent', () => {
  let component: CreateToolsComponent;
  let fixture: ComponentFixture<CreateToolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateToolsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateToolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
