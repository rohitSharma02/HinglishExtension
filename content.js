// Variable to track the timestamp of the last translation request
let lastRequestTimestamp = 0;

// Variable to track the number of API requests
let apiRequestCount = 0;

// Function to handle translation with rate limiting
function translateWithRateLimit(text) {
  const now = Date.now();
  const minInterval = 5000; // Minimum interval in milliseconds (adjust as needed)

  if (now - lastRequestTimestamp < minInterval) {
    console.log('Rate limiting: Too many requests in a short interval. Waiting...');
    setTimeout(() => {
      translateWithRateLimit(text);
    }, minInterval);
  } else {
    // Update the last request timestamp
    lastRequestTimestamp = now;

    // Increment the API request count
    apiRequestCount++;

    // Log the number of API requests
    console.log('Number of API requests:', apiRequestCount);

    // Call the ChatGPT API for translation
    translateWithGPT3(text)
      .then(translatedText => {
        // Update the webpage content with the translated text
        document.body.innerHTML = translatedText;
      })
      .catch(error => {
        console.error('Translation error:', error);
      });
  }
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('Content script received message:', request);
  if (request.action === 'translate') {
    // Fetch webpage content
    fetch(window.location.href)
      .then(response => response.text())
      .then(html => {
        // Extract text content from the webpage
        const textToTranslate = stripHtml(html);
        console.log('Text extracted for translation:', textToTranslate);

        // Call the ChatGPT API for translation with rate limiting
        translateWithRateLimit(textToTranslate);
      })
      .catch(error => {
        console.error('Fetch error:', error);
      });
  }
});

// Function to strip HTML tags from the text
function stripHtml(html) {
  let doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
}

// Function to call ChatGPT API for translation
async function translateWithGPT3(text) {
  // Replace 'YOUR_API_KEY' with your actual OpenAI GPT-3 API key
  const apiKey = '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';
  const apiUrl = 'https://api.openai.com/v1/engines/davinci/completions';

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      prompt: `Translate the following English text to Hinglish: "${text}"`,
      max_tokens: 150,
    }),
  });

  const result = await response.json();
  console.log("result", result);

  if (result.choices && result.choices[0] && result.choices[0].text) {
    return result.choices[0].text.trim();
  } else {
    throw new Error('Translation failed');
  }
}
