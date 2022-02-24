import { TestBed } from '@angular/core/testing';

import { PatientServices } from './patient-services.service';

describe('PatientServices', () => {
  let service: PatientServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PatientServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
