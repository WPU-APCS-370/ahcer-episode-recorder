import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewEpisodeComponent } from './view-episode.component';

describe('ViewEpisodeComponent', () => {
  let component: ViewEpisodeComponent;
  let fixture: ComponentFixture<ViewEpisodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewEpisodeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewEpisodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
