import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../../shared/course.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-edit-course',
  templateUrl: './edit-course.component.html',
  styleUrl: './edit-course.component.css'
})
export class EditCourseComponent implements OnInit{
  constructor(private route: ActivatedRoute, private router: Router,private courseService:CourseService){}
  course: { id: string; title: string; description: string } | null = null;
  private courseSubscription: Subscription | null = null;
  ngOnInit(): void {
    // Get the course ID from the route parameters
    const courseId = this.route.snapshot.paramMap.get('id');
    if (courseId) {
      this.loadCourse(courseId);
    }
  }
  // Load the course details from the service
  loadCourse(courseId: string): void {
    this.courseSubscription =this.courseService.getCourseById(courseId).subscribe({
      next: (course) => {
        if (course) {
          this.course = course; // Success: assign course details
        } else {
          console.error('Course not found');
          alert('Course not found.');
          this.router.navigate(['/coursemanagement']);
        }
      },
      error: (error) => {
        console.error('Error loading course:', error); // Handle Observable errors
        alert('Failed to load course details.');
        this.router.navigate(['/coursemanagement']);
      },
    });

  }

  onSubmit(): void {
    if (this.course) {
      this.courseService.updateCourse(this.course.id, {
        title: this.course.title,
        description: this.course.description,
      }).then(() => {
        alert('Course updated successfully');
        this.router.navigate(['/coursemanagement']);
      }).catch((error) => {
        console.error('Error updating course:', error);
        alert('Failed to update course.');
      });
    }
  }
  ngOnDestroy(): void {
    if (this.courseSubscription) {
      this.courseSubscription.unsubscribe(); // Unsubscribe from the observable
    }
  }
}
