import { ChangeDetectorRef, Component, input } from '@angular/core';
import { Input, SimpleChanges } from '@angular/core';
import { Sensor } from '../../../../stations/model/sensor';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-pressure',
  imports: [CommonModule],
  templateUrl: './pressure.html',
  styleUrl: './pressure.scss',
})
export class Pressure {
  @Input() station: any;
  sensors: Sensor[] = [];
  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit(): void {}
  readonly minPressure = 0;
  readonly maxPressure = 550;
  get stages() {
    if (!this.station) return [];
    return [1, 2, 3, 4, 5, 6].map((i) => ({
      label: `Stage ${i}`,
      value: this.station[`stage${i}_Pressure`] ?? null,
    }));
  }
  isInvalidValue(value: any): boolean {
    return value === null || value === undefined || value === 0 || value === -1;
  }
  getRatio(value: number | null): number {
    if (value === null || value === undefined) return 0;
    return Math.min(
      Math.max((value - this.minPressure) / (this.maxPressure - this.minPressure), 0),
      1,
    );
  }

  getNeedleRotation(value: number | null): number {
    const ratio = this.getRatio(value);
    return -90 + ratio * 180;
  }

  getArcPath(value: number | null): string {
    const ratio = this.getRatio(value);
    if (ratio <= 0) return '';

    const cx = 80,
      cy = 80,
      r = 60;

    const startX = cx - r; // = 20
    const startY = cy; // = 80

    const angleRad = Math.PI - ratio * Math.PI;
    const endX = cx + r * Math.cos(angleRad);
    const endY = cy + r * Math.sin(angleRad);

    const largeArc = ratio > 0.5 ? 1 : 0;

    return `M ${startX} ${startY} A ${r} ${r} 0 ${largeArc} 1 ${endX.toFixed(2)} ${endY.toFixed(2)}`;
  }

  getColor(value: number | null): string {
    if (this.isInvalidValue(value)) return '#DDDDDD';

    const v = value as number;

    if (v >= 0.1 && v <= 50) return '#38d3fa';
    if (v >= 51 && v <= 150) return '#0663f9';
    if (v >= 151 && v <= 300) return '#045ff1';
    if (v >= 301 && v <= 486) return '#010355';

    return '#DDDDDD';
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['station']) {
      this.cd.detectChanges();
    }
  }
  readonly minTemp = 0;
  readonly maxTemp = 255;
  isInvalidValues(value: any): boolean {
    return value === null || value === undefined || value === 0 || value === -1;
  }
  // convert the stations data to array , ex {label: 'Stage 1', value: 155}
  get Temp() {
    if (!this.station) return [];
    return [1, 2, 3, 4, 5, 6].map((i) => ({
      label: `Stage ${i}`,
      value: this.station[`stage${i}_Temprature`] ?? null,
    }));
  }
  // convert temprature value to fill ratio between 0 and 1, 0 -> 0% , 150 -> 50% , 300 -> 100%
  getFillRatio(value: number | null): number {
    if (value === null || value === undefined) return 0;
    return Math.min(Math.max((value - this.minTemp) / (this.maxTemp - this.minTemp), 0), 1);
  }
  // ui
  getFillHeight(value: number | null): number {
    return this.getFillRatio(value) * 43;
  }

  getFillY(value: number | null): number {
    return 78 - this.getFillHeight(value);
  }

  getColors(value: number | null): string {
    if (this.isInvalidValue(value)) return '#DDDDDD';

    const v = value as number;

    if (v >= 51 && v <= 150) return '#09ae30';
    if (v >= 151 && v <= 250) return '#F97316';
    if (v >= 251 && v <= 350) return '#EF4444';
    if (v >= 351 && v <= 392) return '#EF4444';

    return '#DDDDDD';
  }
}
