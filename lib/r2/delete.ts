import { deleteObject } from "./client";

/**
 * Delete an image from R2 storage using REST API.
 * Idempotent - safe to call multiple times.
 * @param objectKey The object key (path) in R2 bucket
 * @returns Promise that resolves when deletion is complete
 */
export async function deleteImageFromR2(objectKey: string): Promise<void> {
  try {
    await deleteObject(objectKey);
  } catch (error) {
    // Log error but don't throw - lifecycle rule will clean up anyway
    console.error(`Failed to delete image ${objectKey} from R2:`, error);
    // Don't throw - deletion failures are not critical since lifecycle rule will clean up
  }
}
