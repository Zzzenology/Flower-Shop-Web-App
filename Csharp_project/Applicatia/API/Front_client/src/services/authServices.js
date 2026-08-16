import axios from 'axios';

const BASE_URL = "http://localhost:5000";
export const registerUser = async (userData) => {
    const response = await fetch(BASE_URL + "/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
    });

    if (!response.ok) {
        throw new Error("Eroare la înregistrare.");
    }

    return await response.json();
};


export const loginUser = async (loginData) => {
    const response = await fetch(BASE_URL + "/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(loginData)
    });

    if (!response.ok) {
        throw new Error("Eroare la înregistrare.");
    }
    return await response.json();

}

export const getUserData = async (token) => {
  const response = await axios.get(BASE_URL+ '/register/profile', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};