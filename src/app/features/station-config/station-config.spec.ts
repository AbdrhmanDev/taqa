import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StationConfig } from './station-config';

describe('StationConfig', () => {
  let component: StationConfig;
  let fixture: ComponentFixture<StationConfig>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StationConfig]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StationConfig);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
