import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportFilterPopupComponent } from './report-filter-popup.component';

describe('ReportFilterPopupComponent', () => {
  let component: ReportFilterPopupComponent;
  let fixture: ComponentFixture<ReportFilterPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportFilterPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportFilterPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
