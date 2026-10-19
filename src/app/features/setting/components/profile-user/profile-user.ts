import { Component, OnInit } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { LogsUser } from '../logs-user/logs-user';
import { User } from '../../../user-management/services/user';

export interface IProfile {
  userName: string;
  email: string;
  phoneNumber: string;
  roles: string[];
  claims: string[];
}

@Component({
  selector: 'app-profile-user',
  imports: [TabsModule, LogsUser],
  templateUrl: './profile-user.html',
  styleUrl: './profile-user.scss',
})
export class ProfileUser implements OnInit {
  profile: IProfile | null = null;
  loading = true;
  error = false;

  constructor(private _User: User) {}

  ngOnInit(): void {
    this._User.getMyProfile().subscribe({
      next: (res) => {
        console.log(res);
        this.profile = this.mapProfile(res?.data ?? res);
        this.loading = false;
      },
      error: (err) => {
        console.log(err);
        this.error = true;
        this.loading = false;
      },
    });
  }

  get initials(): string {
    const name = this.profile?.userName || this.profile?.email || '';
    return name.slice(0, 2).toUpperCase();
  }

  // The API response shape is not documented, so accept the common casings.
  private mapProfile(res: any): IProfile {
    return {
      userName: res?.userName ?? res?.username ?? res?.UserName ?? '',
      email: res?.email ?? res?.Email ?? '',
      phoneNumber: res?.phoneNumber ?? res?.PhoneNumber ?? '',
      roles: this.toList(res?.roles ?? res?.Roles ?? res?.roleName ?? res?.role),
      claims: this.toList(res?.claims ?? res?.Claims).map((c: any) =>
        typeof c === 'string' ? c : (c?.value ?? c?.type ?? c?.claimValue ?? ''),
      ),
    };
  }

  private toList(value: any): any[] {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }
}
