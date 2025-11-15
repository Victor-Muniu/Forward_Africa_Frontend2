import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export interface UploadOptions {
  onProgress?: (progress: number) => void;
}

/**
 * Upload instructor profile image to Firebase Storage
 */
export async function uploadInstructorImage(
  file: File,
  instructorId: string,
  options?: UploadOptions
): Promise<string> {
  try {
    // Create a unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 5);
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `instructor-${instructorId}-${timestamp}-${random}.${ext}`;

    // Create storage reference
    const storageRef = ref(storage, `instructors/${instructorId}/${filename}`);

    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadUrl = await getDownloadURL(snapshot.ref);

    return downloadUrl;
  } catch (error) {
    console.error('Error uploading instructor image:', error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload avatar image to Firebase Storage
 */
export async function uploadAvatarImage(
  file: File,
  userId: string,
  options?: UploadOptions
): Promise<string> {
  try {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 5);
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `avatar-${userId}-${timestamp}-${random}.${ext}`;

    const storageRef = ref(storage, `avatars/${userId}/${filename}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);

    return downloadUrl;
  } catch (error) {
    console.error('Error uploading avatar image:', error);
    throw new Error(`Failed to upload avatar: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload course thumbnail to Firebase Storage
 */
export async function uploadCourseThumbnail(
  file: File,
  courseId: string,
  options?: UploadOptions
): Promise<string> {
  try {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 5);
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `thumbnail-${courseId}-${timestamp}-${random}.${ext}`;

    const storageRef = ref(storage, `courses/${courseId}/thumbnails/${filename}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);

    return downloadUrl;
  } catch (error) {
    console.error('Error uploading course thumbnail:', error);
    throw new Error(`Failed to upload thumbnail: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload course banner to Firebase Storage
 */
export async function uploadCourseBanner(
  file: File,
  courseId: string,
  options?: UploadOptions
): Promise<string> {
  try {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 5);
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `banner-${courseId}-${timestamp}-${random}.${ext}`;

    const storageRef = ref(storage, `courses/${courseId}/banners/${filename}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);

    return downloadUrl;
  } catch (error) {
    console.error('Error uploading course banner:', error);
    throw new Error(`Failed to upload banner: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload lesson thumbnail to Firebase Storage
 */
export async function uploadLessonThumbnail(
  file: File,
  courseId: string,
  lessonId: string,
  options?: UploadOptions
): Promise<string> {
  try {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 5);
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `thumbnail-${lessonId}-${timestamp}-${random}.${ext}`;

    const storageRef = ref(storage, `courses/${courseId}/lessons/${lessonId}/thumbnails/${filename}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);

    return downloadUrl;
  } catch (error) {
    console.error('Error uploading lesson thumbnail:', error);
    throw new Error(`Failed to upload lesson thumbnail: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload certificate image to Firebase Storage
 */
export async function uploadCertificateImage(
  file: File,
  certificateId: string,
  options?: UploadOptions
): Promise<string> {
  try {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 5);
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `certificate-${certificateId}-${timestamp}-${random}.${ext}`;

    const storageRef = ref(storage, `certificates/${certificateId}/${filename}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);

    return downloadUrl;
  } catch (error) {
    console.error('Error uploading certificate image:', error);
    throw new Error(`Failed to upload certificate: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete image from Firebase Storage
 */
export async function deleteStorageFile(fileUrl: string): Promise<void> {
  try {
    // Extract the file path from the download URL
    const urlPattern = /\/o\/(.*?)\?/;
    const match = fileUrl.match(urlPattern);
    
    if (!match || !match[1]) {
      console.warn('Could not extract file path from URL:', fileUrl);
      return;
    }

    const filePath = decodeURIComponent(match[1]);
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting file from storage:', error);
    throw error;
  }
}
