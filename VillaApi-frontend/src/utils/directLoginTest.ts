import { authService } from "../services";

// Direct login test to debug the issue
export const testDirectLogin = async () => {
  try {
    console.log('🧪 Testing direct login...');
    
    const formData = new FormData();
    formData.append('username', 'admin');
    formData.append('password', 'admin');
    
    console.log('📤 FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}: ${value}`);
    }
    
    const response = await fetch(`${authService.GetBaseUrl()}/Login`, {
      method: 'POST',
      body: formData
    });
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('📥 Response data:', data);
      return data;
    } else {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
      return null;
    }
  } catch (error) {
    console.log('❌ Direct login error:', error);
    return null;
  }
};
