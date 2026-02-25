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

  enableAdvanced = true;
  showFrequency = true;
  showDuration = true;

  freqTimes = 10;
  freqWithin = 10;
  freqUnit = 'minutes';
  durTime = 10;
  durUnit = 'minutes';

  timeUnits = [
    { label: 'minutes', value: 'minutes' },
    { label: 'hours', value: 'hours' },
    { label: 'days', value: 'days' },
  ];

  priorityOptions = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
    { label: 'Critical', value: 'critical' },
  ];

  autoAssignOptions = [
    { label: 'unassigned', value: 'unassigned' },
    { label: 'Team Lead', value: 'teamlead' },
    { label: 'Engineer', value: 'engineer' },
  ];

  availableActions: any[] = [
    {
      type: 'ticket',
      title: 'Create Maintenance Ticket',
      description: 'Automatically create a maintenance ticket',
    },
    {
      type: 'log',
      title: 'Log only',
      description: 'Record alarm in system log without notification',
    },
    {
      type: 'email',
      title: 'Email Notification',
      description: 'Send email to specified recipients',
    },
  ];

  actions: any[] = [
    {
      id: 1,
      type: 'ticket',
      title: 'Create Maintenance Ticket',
      description: 'Automatically create a maintenance ticket',
      enabled: true,
      priority: '',
      autoAssign: 'unassigned',
    },
    {
      id: 2,
      type: 'email',
      title: 'Email Notification',
      description: 'Send email to specified recipients',
      enabled: true,
      recipients: 'engineer@company.com,manager@company.com',
    },
    {
      id: 3,
      type: 'log',
      title: 'Log only',
      description: 'Record alarm in system log without notification',
      enabled: true,
    },
  ];

  getIconBg(type: string): string {
    const map: Record<string, string> = {
      ticket: 'bg-violet-100',
      log: 'bg-orange-100',
      email: 'bg-red-100',
    };
    return map[type] || 'bg-gray-100';
  }

  getIconColor(type: string): string {
    const map: Record<string, string> = {
      ticket: 'text-violet-700',
      log: 'text-orange-700',
      email: 'text-red-600',
    };
    return map[type] || 'text-gray-600';
  }

  getCardBorder(type: string): string {
    const map: Record<string, string> = {
      ticket: 'bg-violet-50 border-violet-200',
      log: 'bg-orange-50 border-orange-200',
      email: 'bg-red-50 border-red-200',
    };
    return map[type] || 'bg-gray-50 border-gray-200';
  }

  moveUp(index: number): void {
    if (index === 0) return;
    const arr = [...this.actions];
    [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
    this.actions = arr;
  }

  moveDown(index: number): void {
    if (index === this.actions.length - 1) return;
    const arr = [...this.actions];
    [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
    this.actions = arr;
  }

  deleteAction(id: number): void {
    this.actions = this.actions.filter((a) => a.id !== id);
  }

  incrementFreq(): void {
    this.freqTimes++;
  }
  decrementFreq(): void {
    if (this.freqTimes > 1) this.freqTimes--;
  }

  cancel(): void {
    console.log('Cancel');
  }

  // previous(): void {
  //   if (this.activeIndex > 0) {
  //     this.activeIndex--;
  //   }
  // }

  // next(): void {
  //   if (this.activeIndex < this.steps.length - 1) {
  //     this.activeIndex++;
  //   }
  // }
}
