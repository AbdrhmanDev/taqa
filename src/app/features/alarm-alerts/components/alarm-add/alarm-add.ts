import { Component } from '@angular/core';
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ChipModule } from 'primeng/chip';

import { FormsModule } from '@angular/forms';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CommonModule } from '@angular/common';
import { EditorModule } from 'primeng/editor';
import { CreateAlarm } from '../create-alarm/create-alarm';
import { PreviewAlarm } from '../preview-alarm/preview-alarm';
@Component({
  selector: 'app-alar-add',
  imports: [
    StepperModule,
    ButtonModule,
    SelectModule,
    FormsModule,
    ReactiveFormsModule,
    RadioButtonModule,
    TagModule,
    EditorModule,
    TextareaModule,
    ChipModule,
    CommonModule,
    CreateAlarm,
    PreviewAlarm,
  ],
  templateUrl: './alarm-add.html',
  styleUrl: './alarm-add.scss',
})
export class AlarmAdd {
  alarmScope: 'single' | 'all' = 'single';
  machine: 'Dispensers' | 'Compressors' = 'Dispensers';
  severityLevel: 'low' | 'medium' | 'critical' = 'low';
  setSeverity(level: 'low' | 'medium' | 'critical') {
    this.severityLevel = level;
  }
  setScope(scope: 'single' | 'all') {
    this.alarmScope = scope;

    if (scope === 'all') {
      this.stations.forEach((station) => (station.selected = true));
    } else {
      this.stations.forEach((station) => (station.selected = false));
    }
  }

  // Options for Parameter dropdown
  parameterOptions: any[] = [
    { name: 'Pressure', value: 'pressure' },
    { name: 'Temperature', value: 'temperature' },
    { name: 'Flow Rate', value: 'flow' },
    { name: 'Level', value: 'level' },
    { name: 'Voltage', value: 'voltage' },
  ];

  // Selected stations (for multiple selection)
  selectedStations: any[] = [];

  // Sample stations data
  stations: any[] = [
    { name: 'North Station 1', zone: 'North zone' },
    { name: 'North Station 1', zone: 'North zone' },
    { name: 'South Station 2', zone: 'South zone' },
    { name: 'East Station 3', zone: 'East zone' },
    { name: 'West Station 4', zone: 'West zone' },
  ];

  // Selected alarm source
  alarmSources: string[] = ['Dispensers']; // Default selection

  // Selected severity
  severity: string = 'medium';

  // Cancel method
  cancel(): void {
    // Add your cancel logic here
    console.log('Cancelled');
  }
}
