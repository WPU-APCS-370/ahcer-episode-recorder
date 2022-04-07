import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewMedicationComponent } from './view-medication.component';

describe('ViewMedicationComponent', () => {
  let component: ViewMedicationComponent;
  let fixture: ComponentFixture<ViewMedicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewMedicationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewMedicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
