/**
 * Logs out the user by removing the token from localStorage
 */
export function logout(): void {
  localStorage.removeItem("token");
}

/**
 * Checks if the user is authenticated by checking for a token in localStorage
 */
export function isAuthenticated(): boolean {
  return !!localStorage.getItem("token");
}

/**
 * Gets the current authentication token
 */
export function getToken(): string | null {
  return localStorage.getItem("token");
}
