import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { FieldValue } from 'firebase/firestore';
import { arrayUnion } from 'firebase/firestore';
import { Course } from '../Admin/course-management/course-management.component';
import { User } from '../Admin/user-management/user-management.component';
import { Assessment } from '../instructor/course-creation/course-creation.component';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { map } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private collectionName = 'courses';
  private usersCollection = 'users';
  private assessmentsCollection = 'assessments';
  constructor(private firestore: AngularFirestore) {}
  // Get all courses

  getCourses(): Observable<any[]> {
    return this.firestore.collection(this.collectionName).valueChanges({ idField: 'id' });// send id also with the the rest of data
  }
  getCourseById(courseId: string): Observable<any> {
    return this.firestore.collection('courses').doc(courseId).valueChanges();
  }
  // Update course details
  updateCourse(courseId: string, updatedData: any): Promise<void> {
    return this.firestore.collection(this.collectionName).doc(courseId).update({
      ...updatedData,
      updatedAt: new Date().toISOString(),
    });
  }

  // Archive a course
  archiveCourse(course: { id: string; isArchived: boolean }): Promise<void> {
    const courseDoc = this.firestore.collection(this.collectionName).doc(course.id);

    // Toggle the current isArchived state
    const updatedStatus = !course.isArchived;

    return courseDoc.update({
      isArchived: updatedStatus,
      updatedAt: new Date().toISOString(),
    });
  }



  // Delete a course
  // Assign an instructor to a course
  addCourseWithInstructor(course: Course): Promise<void> {
    const courseId = this.firestore.createId();
    const courseRef = this.firestore.collection(this.collectionName).doc(courseId);
    const instructorRef = this.firestore.collection<User>(this.usersCollection).doc(course.instructorId);//pointer to the documnet

    return this.firestore.firestore.runTransaction(async (transaction) => {
      // Read the instructor document first
      const instructorDoc = await transaction.get(instructorRef.ref);
      const instructorData = instructorDoc.data() as User | undefined;

      if (!instructorData) {
        throw new Error('Instructor not found.');
      }

      const courseData = {
        ...course,
        id: courseId,
        instructorId: course.instructorId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isArchived: false,
      };

      const assignedCourses = instructorData.assignedCourses ?? [];
      transaction.set(courseRef.ref, courseData);
      transaction.update(instructorRef.ref,{
      assignedCourses:Array.from(new Set([...assignedCourses, courseId])),
})

    });
  }
  getCoursesForInstructor(instructorId: string): Observable<Course[]> {
    console.log('Fetching courses for instructor ID:', instructorId); // Debug log
    return this.firestore
      .collection<Course>(this.collectionName, (ref) => ref.where('instructorId', '==', instructorId))
      .valueChanges({ idField: 'id' })
      .pipe(
        map(courses => courses.filter(course => !course.isArchived)) // Filter archived courses
      );
  }

  //private firestoreInstance = getFirestore();
  async addMaterial(courseId: string, material: string): Promise<void> {
    const courseRef = this.firestore.collection(this.collectionName).doc(courseId);

    return this.firestore.firestore.runTransaction(async (transaction) => {
      // Get the current course document
      const courseDoc = await transaction.get(courseRef.ref);
      const courseData = courseDoc.data() as Course;

      if (!courseData) {
        throw new Error('Course not found.');
      }

      // Get the existing materials array or initialize it
      const currentMaterials = courseData.materials || [];

      // Add the new material to the array (ensure no duplicates, if needed)
      const updatedMaterials = [...currentMaterials, material];

      // Update the materials array in the database
      transaction.update(courseRef.ref, { materials: updatedMaterials });
    });
  }

  createAssessment(assessment: Assessment): Promise<void> {
    const assessmentData = {
      ...assessment,
      createdAt: new Date().toISOString(), // Ensure a fresh timestamp
    };

    return this.firestore
      .collection<Assessment>(this.assessmentsCollection)
      .add(assessmentData)
      .then(() => {
        console.log('Assessment created successfully');
      })
      .catch((error) => {
        console.error('Error creating assessment:', error);
        throw error; // Re-throw for handling in the component
      });
  }
  getCoursesForStudent(studentId: string): Observable<Course[]> {
    return this.firestore
      .collection<Course>(this.collectionName, (ref) => ref.where('enrolledStudents', 'array-contains', studentId))
      .valueChanges({ idField: 'id' }).pipe(
        map(courses => courses.filter(course => !course.isArchived))
      );
  }


  getStudentsForCourse(courseId: string): Observable<any[]> {
    return this.firestore
      .collection('users', (ref) =>
        ref.where('enrolledCourses', 'array-contains', courseId)
      )
      .valueChanges();
  }



  getCoursesByIds(courseIds: string[]): Observable<Course[]> {
    return this.firestore
      .collection<Course>(this.collectionName, (ref) => ref.where('id', 'in', courseIds))
      .valueChanges({ idField: 'id' });
  }

  deleteCourse(courseId: string): Promise<void> {
    const courseRef = this.firestore.collection(this.collectionName).doc(courseId);

    return this.firestore.firestore.runTransaction(async (transaction) => {
      // Get the course document to verify it exists
      const courseDoc = await transaction.get(courseRef.ref);
      if (!courseDoc.exists) {
        throw new Error('Course not found.');
      }

      // Query all users who have this course in their enrolledCourses array
      const studentsSnapshot = await this.firestore.firestore
        .collection('users')
        .where('enrolledCourses', 'array-contains', courseId)
        .get();

      // Remove the course ID from each student's enrolledCourses array
      studentsSnapshot.forEach((studentDoc) => {
        const studentRef = studentDoc.ref;
        const studentData = studentDoc.data();

        if (studentData) {
          // Safely access 'enrolledCourses' with index signature
          const updatedCourses = (studentData['enrolledCourses'] || []).filter(
            (id: string) => id !== courseId
          );
          transaction.update(studentRef, { enrolledCourses: updatedCourses });
        }
      });

      // Delete the course document
      transaction.delete(courseRef.ref);
    });
  }
}
