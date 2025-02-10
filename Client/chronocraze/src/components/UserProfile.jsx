import { useState, useEffect } from "react";
import "../styles/UserProfile.css"; // Import CSS file
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

// Function to decode token and extract userId
const getUserId = (token) => {
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      return decodedToken.id || null;  // Ensure 'id' exists in token payload
    } catch (error) {
      console.error("Error decoding the token:", error);
      return null;
    }
  }
  console.error("No token found.");
  return null;
};

const UserProfile = () => {
  const [user, setUser] = useState({ username: "", email: "" });
  const [userId, setUserId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ username: "", email: "" });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Token is missing!");
          return;
        }

        // Decode token and set userId
        const userIdDecode = getUserId(token);
        if (!userIdDecode) {
          console.error("User ID not found in token!");
          return;
        }

        setUserId(userIdDecode);

        // Fetch user data only after userId is set
        const response = await axios.get(
          `http://localhost:5004/api/users/${userIdDecode}`, // Use decoded userId
          { headers: { Authorization: `Bearer ${token}` } }
        );

       // setUser(response.data);
       // setFormData(response.data);
       setUser({
        username: response.data.username ?? "",
        email: response.data.email ?? "",
      });
      setFormData({
        username: response.data.username ?? "",
        email: response.data.email ?? "",
      });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUser();
  }, []); // Runs only once when the component mounts

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token missing, cannot update user.");
        return;
      }

      await axios.put(
        `http://localhost:5004/api/users/${userId}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUser(formData);
      setEditing(false);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  return (
    <div className="card">
      <h2>User Profile</h2>
      {editing ? (
        <>
          <input
            type="text"
            name="username"
            value={formData.username || ""}
            onChange={handleChange}
            className="input-field"
            placeholder="Username"
          />
          <input
            type="email"
            name="email"
            value={formData.email || ""}
            onChange={handleChange}
            className="input-field"
            placeholder="Email"
          />
          <button onClick={handleSave} className="button primary">Save</button>
          <button onClick={() => setEditing(false)} className="button secondary">Cancel</button>
        </>
      ) : (
        <>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <button onClick={() => setEditing(true)} className="button primary">Edit</button>
        </>
      )}
    </div>
  );
};

export default UserProfile;
