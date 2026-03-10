import { TestBed } from '@angular/core/testing';

import { RealtimeStationDetails } from './realtime-station-details';

describe('RealtimeStationDetails', () => {
  let service: RealtimeStationDetails;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RealtimeStationDetails);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
