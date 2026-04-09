import { Component, Input, SimpleChanges } from '@angular/core';
import { Sensor } from '../../../../stations/model/sensor';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-tempreture',
  imports: [CommonModule, FormsModule],
  templateUrl: './tempreture.html',
  styleUrl: './tempreture.scss',
})
export class Tempreture {
  @Input() station: any;

  get dispenserGroups(): any[] {
    if (!this.station?.dispensers) return [];

    const groupMap = new Map<string, any>();

    for (const d of this.station.dispensers) {
      const parts = d.despId.split('_');
      // AUC02_1_01 → parts = ['AUC02', '1', '01']
      const groupId = parts.slice(0, 2).join('_'); // 'AUC02_1'
      const nozzleNum = parts[2]; // '01' or '02'
      const side: 'Left' | 'Right' = nozzleNum === '01' ? 'Left' : 'Right';

      if (!groupMap.has(groupId)) {
        groupMap.set(groupId, {
          groupId,
          left: null,
          right: null,
          maxValue: 0,
        });
      }

      const group = groupMap.get(groupId)!;
      const nozzle: any = { label: d.despId, value: d.gasVolumeSold, side };

      if (side === 'Left') group.left = nozzle;
      else group.right = nozzle;

      group.maxValue = Math.max(group.maxValue, d.gasVolumeSold);
    }

    return Array.from(groupMap.values());
  }

  getBars(value: number, maxValue: number): { filled: boolean }[] {
    const totalBars = 10;
    const filledCount = Math.round((value / maxValue) * totalBars);
    return Array.from({ length: totalBars }, (_, i) => ({
      filled: totalBars - i <= filledCount,
    }));
  }
}
