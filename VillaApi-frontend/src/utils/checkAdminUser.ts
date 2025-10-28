// Check if admin user exists in database
export const checkAdminUser = async () => {
  try {
    console.log('🔍 Checking if admin user exists...');
    
    // Try to get all users (this endpoint might require authentication)
    const response = await fetch('https://localhost:7210/api/Users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📥 Users response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📥 Users data:', data);
      
      if (data.isSuccessfull && data.data) {
        const users = data.data;
        const adminUser = users.find((user: any) => user.username === 'admin');
        
        if (adminUser) {
          console.log('✅ Admin user found:', adminUser);
          return true;
        } else {
          console.log('❌ Admin user not found in database');
          console.log('Available users:', users.map((u: any) => u.username));
          return false;
        }
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Error getting users:', errorText);
    }
    
    return false;
  } catch (error) {
    console.log('❌ Error checking admin user:', error);
    return false;
  }
};
