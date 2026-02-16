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
    TextareaModule,
    ChipModule,
  ],
  templateUrl: './alarm-add.html',
  styleUrl: './alarm-add.scss',
})
export class AlarmAdd {
  alarmScope: string = 'single';

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
