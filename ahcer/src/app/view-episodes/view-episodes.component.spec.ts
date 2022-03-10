import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewEpisodesComponent } from './view-episodes.component';

describe('ViewEpisodesComponent', () => {
  let component: ViewEpisodesComponent;
  let fixture: ComponentFixture<ViewEpisodesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewEpisodesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewEpisodesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
