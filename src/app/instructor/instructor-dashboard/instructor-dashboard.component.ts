import { Component, OnInit } from '@angular/core';
import { CourseService } from '../../shared/course.service';
import { AuthService } from '../../shared/auth.service';
import { Course } from '../../Admin/course-management/course-management.component';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-instructor-dashboard',
  templateUrl: './instructor-dashboard.component.html',
  styleUrls: ['./instructor-dashboard.component.css']
})
export class InstructorDashboardComponent  implements OnInit {
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
