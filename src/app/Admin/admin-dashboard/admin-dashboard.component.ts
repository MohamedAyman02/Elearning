import { Component, OnInit } from '@angular/core';
import { UserService } from '../../shared/user.service';
import { AuthService } from '../../shared/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  userEmail: string | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.fetchUserEmail();
  }

  async fetchUserEmail() {
    try {
      this.userEmail = await this.authService.getLoggedInUserEmail();
    } catch (error) {
      console.error('Error fetching user email:', error);
    }
  }
}
