import { TestBed } from '@angular/core/testing';

import { AllStation } from './all-station';

describe('AllStation', () => {
  let service: AllStation;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AllStation);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
