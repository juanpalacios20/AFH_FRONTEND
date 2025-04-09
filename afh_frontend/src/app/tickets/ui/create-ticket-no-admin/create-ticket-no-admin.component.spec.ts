import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTicketNoAdminComponent } from './create-ticket-no-admin.component';

describe('CreateTicketNoAdminComponent', () => {
  let component: CreateTicketNoAdminComponent;
  let fixture: ComponentFixture<CreateTicketNoAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateTicketNoAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateTicketNoAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
