import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeWorkCustomerComponent } from './home-work-customer.component';

describe('HomeWorkCustomerComponent', () => {
  let component: HomeWorkCustomerComponent;
  let fixture: ComponentFixture<HomeWorkCustomerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeWorkCustomerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeWorkCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
