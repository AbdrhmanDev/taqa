import { Component } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { LogsUser } from '../logs-user/logs-user';
@Component({
  selector: 'app-profile-user',
  imports: [TabsModule, LogsUser],
  templateUrl: './profile-user.html',
  styleUrl: './profile-user.scss',
})
export class ProfileUser {}
