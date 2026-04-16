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
  getColor(value: number | null): string {
    if (this.isInvalidValue(value)) return '#e2e8f0';
    const v = value as number;
    if (v < 100) return '#22C55E'; // Green
    if (v < 250) return '#EAB308'; // Yellow
    if (v < 400) return '#F97316'; // Orange
    return '#EF4444'; // Red
  }

  getRatio(value: number | null): number {
    if (this.isInvalidValue(value)) return 0;
    return Math.min(
      Math.max(((value as number) - this.minPressure) / (this.maxPressure - this.minPressure), 0),
      1,
    );
  }

  getNeedleRotation(value: number | null): number {
    const ratio = this.getRatio(value);
    return -120 + ratio * 240;
  }

  getArcPath(value: number | null): string {
    const ratio = this.getRatio(value);
    if (ratio <= 0) return '';
    return this.describeArc(80, 80, 60, -120, -120 + ratio * 240);
  }

  polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  }

  describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
    if (endAngle <= startAngle) return '';
    const start = this.polarToCartesian(x, y, radius, endAngle);
    const end = this.polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  }

  getTickMarks() {
    const ticks = [];
    for (let i = 0; i <= 10; i++) {
      const angle = -120 + i * 24;
      const inner = this.polarToCartesian(80, 80, 52, angle);
      const outer = this.polarToCartesian(80, 80, 60, angle);
      ticks.push({ x1: inner.x, y1: inner.y, x2: outer.x, y2: outer.y });
    }
    return ticks;
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

    if (v < 20) return '#3B82F6'; // Blue
    if (v < 51) return '#22C55E'; // Green
    if (v <= 150) return '#EAB308'; // Yellow
    if (v <= 250) return '#F97316'; // Orange
    return '#EF4444'; // Red
  }
}
