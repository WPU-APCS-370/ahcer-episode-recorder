import { TestBed } from '@angular/core/testing';

import { UserIdResolver } from './user-id.resolver';

describe('UserIdResolver', () => {
  let resolver: UserIdResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(UserIdResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
