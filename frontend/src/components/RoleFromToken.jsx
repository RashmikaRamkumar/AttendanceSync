import {jwtDecode} from 'jwt-decode'; // Correct import for jwt-decode
 // Correct import for jwt-decode

const RoleFromToken = () => {
  // Log all session storage items to inspect them
  console.log('SessionStorage Contents:', { ...sessionStorage });

  const token = sessionStorage.getItem('authToken'); // Retrieve the token from sessionStorage
  console.log('Token Retrieved from sessionStorage:', token); // Log token to verify if it's retrieved

  // Check if the token is available
  if (token) {
    console.log('Token is available, proceeding to decode...');
    try {
      // Decode the JWT token
      const decoded = jwtDecode(token);
      console.log('Decoded Token:', decoded); // Log the decoded token

      // Check if the decoded token contains the 'role' property
      if (decoded && decoded.role) {
        console.log('Role found in decoded token:', decoded.role);
        return decoded.role; // Return the role from decoded token
      } else {
        console.log('Role not found in decoded token');
      }
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  } else {
    console.log('No token found in sessionStorage');
  }

  // If no valid token found or role is missing, return null
  return null;
};

export default RoleFromToken;
