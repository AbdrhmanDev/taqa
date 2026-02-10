import { TestBed } from '@angular/core/testing';

import { Authen } from './authen';

describe('Authen', () => {
  let service: Authen;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Authen);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
