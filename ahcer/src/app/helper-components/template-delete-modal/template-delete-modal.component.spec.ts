import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateDeleteModalComponent } from './template-delete-modal.component';

describe('TemplateDeleteModalComponent', () => {
  let component: TemplateDeleteModalComponent;
  let fixture: ComponentFixture<TemplateDeleteModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TemplateDeleteModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateDeleteModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
