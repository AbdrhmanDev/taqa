import { SelectModule } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';


import { InputTextModule } from 'primeng/inputtext';
import { StepsModule } from 'primeng/steps';

interface Action {
  id: number;
  type: string;
  icon: string;
  title: string;
  description: string;
  enabled: boolean;
  priority?: string;
  autoAssign?: string;
  recipients?: string;
}

interface TimeUnit {
  label: string;
  value: string;
}

@Component({
  selector: 'app-create-alarm',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CheckboxModule,
    ButtonModule,
    InputNumberModule,
    SelectModule,
    InputTextModule,
   
    StepsModule,
  ],
  templateUrl: './create-alarm.html',
  styleUrl: './create-alarm.scss',
})
export class CreateAlarm {
  steps: MenuItem[] = [
    { label: 'Create Alarm' },
    { label: 'Alert Actions' },
    { label: 'Preview Results' },
  ];

  activeIndex: number = 1;
  enableAdvancedRules: boolean = true;

  frequencyTimes: number = 10;
  frequencyDuration: number = 10;
  frequencyUnit: TimeUnit = { label: 'minutes', value: 'minutes' };

  durationTime: number = 10;
  durationUnit: TimeUnit = { label: 'minutes', value: 'minutes' };

  timeUnits: TimeUnit[] = [
    { label: 'seconds', value: 'seconds' },
    { label: 'minutes', value: 'minutes' },
    { label: 'hours', value: 'hours' },
  ];

  priorityOptions = [
    { label: 'Select priority', value: '' },
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
    { label: 'Critical', value: 'critical' },
  ];

  autoAssignOptions = [
    { label: 'unassigned', value: 'unassigned' },
    { label: 'Team Lead', value: 'team_lead' },
    { label: 'On-call Engineer', value: 'on_call' },
  ];

  actions: Action[] = [
    {
      id: 1,
      type: 'ticket',
      icon: 'pi pi-cog',
      title: 'Create Maintenance Ticket',
      description: 'Automatically create a maintenance ticket',
      enabled: true,
      priority: '',
      autoAssign: 'unassigned',
    },
    {
      id: 2,
      type: 'email',
      icon: 'pi pi-envelope',
      title: 'Email Notification',
      description: 'Send email to specified recipients',
      enabled: true,
      recipients: 'engineer@company.com,manager@company.com',
    },
    {
      id: 3,
      type: 'log',
      icon: 'pi pi-bell',
      title: 'Log only',
      description: 'Record alarm in system log without notification',
      enabled: true,
    },
  ];

  availableActions = [
    {
      type: 'ticket',
      icon: 'pi pi-cog',
      title: 'Create Maintenance Ticket',
      description: 'Automatically create a maintenance ticket',
    },
    {
      type: 'log',
      icon: 'pi pi-bell',
      title: 'Log only',
      description: 'Record alarm in system log without notification',
    },
    {
      type: 'email',
      icon: 'pi pi-envelope',
      title: 'Email Notification',
      description: 'Send email to specified recipients',
    },
  ];

  deleteAction(actionId: number): void {
    this.actions = this.actions.filter((a) => a.id !== actionId);
  }

  moveActionUp(index: number): void {
    if (index > 0) {
      [this.actions[index], this.actions[index - 1]] = [
        this.actions[index - 1],
        this.actions[index],
      ];
    }
  }

  moveActionDown(index: number): void {
    if (index < this.actions.length - 1) {
      [this.actions[index], this.actions[index + 1]] = [
        this.actions[index + 1],
        this.actions[index],
      ];
    }
  }

  cancel(): void {
    console.log('Cancel');
  }

  previous(): void {
    if (this.activeIndex > 0) {
      this.activeIndex--;
    }
  }

  next(): void {
    if (this.activeIndex < this.steps.length - 1) {
      this.activeIndex++;
    }
  }
}
