import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpisodeReportComponent } from './episode-report.component';

describe('EpisodeReportComponent', () => {
  let component: EpisodeReportComponent;
  let fixture: ComponentFixture<EpisodeReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EpisodeReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EpisodeReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
