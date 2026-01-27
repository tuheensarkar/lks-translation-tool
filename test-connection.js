// Test connection to the backend
async function testBackendConnection() {
  try {
    console.log('Testing connection to backend...');
    
    // Test the backend endpoint
    const response = await fetch('http://20.20.20.205:5000/api/process-translation', {
      method: 'GET', // Try a simple GET first to test connectivity
      headers: {
        'Authorization': 'Bearer tr_api_1234567890abcdefghijklmnopqrstuvwxyz'
      }
    });
    
    console.log('Backend connection test response status:', response.status);
    
    if (response.ok) {
      console.log('Backend connection successful!');
      const data = await response.json();
      console.log('Response data:', data);
    } else {
      console.log('Backend responded but with error status:', response.status);
    }
  } catch (error) {
    console.log('Backend connection failed:', error.message);
  }
}

// Test the translation endpoint with a POST request
async function testTranslationRequest() {
  try {
    console.log('\nTesting translation request...');
    
    // Create a mock form data
    const formData = new FormData();
    // Add mock data for testing
    formData.append('sourceLanguage', 'en');
    formData.append('targetLanguage', 'es');
    formData.append('documentType', 'text');
    
    // We can't add a real file without a DOM environment, so we'll test with minimal data
    const response = await fetch('http://20.20.20.205:5000/api/process-translation', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer tr_api_1234567890abcdefghijklmnopqrstuvwxyz'
        // Note: Don't set Content-Type header when using FormData, the browser sets it with the boundary
      },
      body: formData
    });
    
    console.log('Translation request response status:', response.status);
    
    if (response.ok) {
      console.log('Translation request successful!');
      const data = await response.json();
      console.log('Response data:', data);
    } else {
      console.log('Translation request failed with status:', response.status);
      try {
        const errorData = await response.text();
        console.log('Error response:', errorData);
      } catch (e) {
        console.log('Could not read error response');
      }
    }
  } catch (error) {
    console.log('Translation request failed:', error.message);
  }
}

// Run tests
console.log('Starting backend connection tests...\n');
testBackendConnection().then(() => {
  setTimeout(testTranslationRequest, 2000);
});