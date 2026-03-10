import { TestBed } from '@angular/core/testing';

import { StationDetails } from './station-details';

describe('StationDetails', () => {
  let service: StationDetails;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StationDetails);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
