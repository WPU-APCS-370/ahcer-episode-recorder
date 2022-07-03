import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteEpisodeComponent } from './delete-episode.component';

describe('DeleteEpisodeComponent', () => {
  let component: DeleteEpisodeComponent;
  let fixture: ComponentFixture<DeleteEpisodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteEpisodeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteEpisodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
