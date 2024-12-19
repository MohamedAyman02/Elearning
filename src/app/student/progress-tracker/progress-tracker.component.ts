import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/auth.service';
import { CourseService } from '../../shared/course.service';
import { UserService } from '../../shared/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-progress-tracker',
  templateUrl: './progress-tracker.component.html',
  styleUrls: ['./progress-tracker.component.css']
})
export class ProgressTrackerComponent implements OnInit  {
  constructor(
    private authService: AuthService,
    private courseService: CourseService,
    private userService: UserService,
  ) {}
  private studSbscription: Subscription| null = null;
  ngOnInit(): void {
    this.authService.getLoggedInUserId()
    .then((userId) => {
      if (userId) {
        this.loadStudentProgress(userId);
      } else {
        console.error('No user ID found');
      }
    })
    .catch((error) => {
      console.error('Error fetching user ID:', error);
    });
  }

  studentProgress: { courseId: string; courseName: string; grade: number }[] = [];

  loadStudentProgress(userId: string): void {
    this.studSbscription=this.userService.getStudentProgress(userId).subscribe((progress) => {
      this.studentProgress = progress;
      console.log('Student Progress with Names:', this.studentProgress);
    });
  }
  ngOnDestroy(): void {
    if (this.studSbscription) {
      this.studSbscription.unsubscribe();
    }
  }

}
