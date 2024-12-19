import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/auth.service';

@Component({
  selector: 'app-student-dashboard',
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css']
})
export class StudentDashboardComponent implements OnInit {
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
