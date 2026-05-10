import axios from 'axios';

/**
 * Securely writes to Firestore via a server-side proxy.
 * This bypasses browser-side Firebase Auth domain restrictions.
 */
/**
 * Securely writes to Firestore via a server-side proxy.
 * This bypasses browser-side Firebase Auth domain restrictions.
 */
export async function proxyWrite(collection: string, docId: string | null, data: any) {
  const passcode = sessionStorage.getItem('admin_passcode');
  if (!passcode) throw new Error("Not logged in as admin.");

  try {
    const response = await axios.post('/api/admin/proxy-write', {
      passcode,
      collection,
      docId,
      data
    });
    return response.data;
  } catch (error: any) {
    console.error("Proxy write failed:", error);
    throw new Error(error.response?.data?.error || "Failed to update item.");
  }
}

export async function proxyDelete(collection: string, docId: string) {
  const passcode = sessionStorage.getItem('admin_passcode');
  if (!passcode) throw new Error("Not logged in as admin.");

  try {
    const response = await axios.post('/api/admin/proxy-delete', {
      passcode,
      collection,
      docId
    });
    return response.data;
  } catch (error: any) {
    console.error("Proxy delete failed:", error);
    throw new Error(error.response?.data?.error || "Failed to delete item.");
  }
}
