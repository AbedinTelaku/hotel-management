// Test authentication endpoints
export const testLogin = async (username: string, password: string) => {
  try {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await fetch('https://localhost:7210/api/Login', {
      method: 'POST',
      body: formData
    });
    
    console.log('Login response:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Login data:', data);
      
      // Store token in localStorage for API calls
      if (data.isSuccessfull && data.data && data.data.token) {
        localStorage.setItem('authToken', data.data.token);
        console.log('✅ Token stored in localStorage');
      }
      
      return data;
    } else {
      const errorText = await response.text();
      console.log('Login error:', errorText);
      return null;
    }
  } catch (error) {
    console.log('Login error:', error);
    return null;
  }
};

export const testRegister = async (username: string, password: string) => {
  try {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await fetch('https://localhost:7210/api/Register', {
      method: 'POST',
      body: formData
    });
    
    console.log('Register response:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Register data:', data);
      return data;
    } else {
      const errorText = await response.text();
      console.log('Register error:', errorText);
      return null;
    }
  } catch (error) {
    console.log('Register error:', error);
    return null;
  }
};
