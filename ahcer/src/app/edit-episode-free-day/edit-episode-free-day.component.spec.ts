import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditEpisodeFreeDayComponent } from './edit-episode-free-day.component';

describe('EditEpisodeFreeDayComponent', () => {
  let component: EditEpisodeFreeDayComponent;
  let fixture: ComponentFixture<EditEpisodeFreeDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditEpisodeFreeDayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditEpisodeFreeDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
