// Cloudflare R2 REST API client using API Token authentication
function getR2Config() {
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;

  if (!apiToken || !accountId || !bucketName) {
    throw new Error(
      "Missing Cloudflare R2 environment variables. Please set CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, and CLOUDFLARE_R2_BUCKET_NAME"
    );
  }

  // R2 endpoint format: https://<account-id>.r2.cloudflarestorage.com
  const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
  const baseUrl = `${endpoint}/${bucketName}`;

  return { apiToken, accountId, bucketName, endpoint, baseUrl };
}

export function getR2BucketName(): string {
  return getR2Config().bucketName;
}

export function getR2AccountId(): string {
  return getR2Config().accountId;
}

/**
 * Fetch an object from R2 using REST API with Bearer token authentication
 */
export async function fetchObject(objectKey: string): Promise<Buffer> {
  const { baseUrl, apiToken } = getR2Config();
  const url = `${baseUrl}/${objectKey}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch object from R2: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Upload an object to R2 using REST API with Bearer token authentication
 * This is used server-side for direct uploads
 */
export async function uploadObject(
  objectKey: string,
  data: Buffer | Blob | Uint8Array,
  contentType: string = "image/jpeg"
): Promise<void> {
  const { baseUrl, apiToken } = getR2Config();
  const url = `${baseUrl}/${objectKey}`;
  
  // Convert Buffer to Uint8Array for fetch compatibility
  const bodyData: BodyInit = Buffer.isBuffer(data) 
    ? new Uint8Array(data) 
    : data instanceof Blob 
    ? data 
    : new Uint8Array(data);
  
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": contentType,
    },
    body: bodyData,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload object to R2: ${response.status} ${response.statusText}`);
  }
}

/**
 * Delete an object from R2 using REST API with Bearer token authentication
 */
export async function deleteObject(objectKey: string): Promise<void> {
  const { baseUrl, apiToken } = getR2Config();
  const url = `${baseUrl}/${objectKey}`;
  
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });

  if (!response.ok && response.status !== 404) {
    // 404 is OK (object doesn't exist), but other errors should be logged
    throw new Error(`Failed to delete object from R2: ${response.status} ${response.statusText}`);
  }
}

/**
 * Generate a presigned URL for client-side upload
 * Note: Cloudflare R2 API tokens don't directly support presigned URLs
 * This function creates a server-side upload endpoint URL that will proxy the upload
 */
export function generateUploadUrl(objectKey: string): string {
  // Return a server-side endpoint that will handle the upload using the API token
  // The client will POST to this endpoint with the file
  return `/api/measurements/upload?objectKey=${encodeURIComponent(objectKey)}`;
}
