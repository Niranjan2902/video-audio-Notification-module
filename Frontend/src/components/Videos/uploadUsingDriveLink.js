const axios = require('axios');

// Function to upload a video from URL to Bunny CDN
async function uploadVideoFromURL(videoURL, storageZone, apiKey) {
  const apiEndpoint = `https://video.bunnycdn.com/library/${storageZone}/upload-from-url`;
  
  const headers = {
    'Accept': 'application/json',
    'Authorization': `Bearer ${apiKey}`,  // Bunny CDN API key
  };

  const data = {
    url: videoURL,
    filename: 'uploaded_video.mp4', // You can customize the filename for each video
    storageZone: storageZone,
  };

  try {
    const response = await axios.post(apiEndpoint, data, { headers });
    console.log('Upload successful:', response.data);
  } catch (error) {
    console.error('Error uploading video:', error);
  }
}

// List of Google Drive video URLs
const videoURLs = [
  'https://drive.google.com/uc?export=download&id=FILE_ID_1',
  'https://drive.google.com/uc?export=download&id=FILE_ID_2',
  'https://drive.google.com/uc?export=download&id=FILE_ID_3',
  // Add more links as needed
];

// Your Bunny CDN storage zone and API key
const storageZone = 'your_storage_zone';
const apiKey = 'your_bunny_cdn_api_key';

// Upload all videos in the list
async function uploadAllVideos() {
  for (const videoURL of videoURLs) {
    await uploadVideoFromURL(videoURL, storageZone, apiKey);
  }
}

uploadAllVideos();




////USING NPM PACKAGE
// const puppeteer = require('puppeteer');
// const axios = require('axios');

// // Upload video to Bunny CDN
// async function uploadVideoFromURL(videoURL, storageZone, apiKey) {
//   const apiEndpoint = `https://video.bunnycdn.com/library/${storageZone}/upload-from-url`;
  
//   const headers = {
//     'Accept': 'application/json',
//     'Authorization': `Bearer ${apiKey}`,  // Bunny CDN API key
//   };

//   const data = {
//     url: videoURL,
//     filename: 'uploaded_video.mp4',  // You can customize the filename
//     storageZone: storageZone,  // Your Bunny CDN storage zone
//   };

//   try {
//     const response = await axios.post(apiEndpoint, data, { headers });
//     console.log('Upload successful:', response.data);
//   } catch (error) {
//     console.error('Error uploading video:', error);
//   }
// }

// // Function to scrape Google Drive folder for file links
// async function scrapeGoogleDriveFolder(folderUrl) {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();
//   await page.goto(folderUrl, { waitUntil: 'networkidle2' });

//   // Scrape all video download links (this is a rough approach)
//   const videoLinks = await page.evaluate(() => {
//     let links = [];
//     const items = document.querySelectorAll('a[href*="drive.google.com"]');
//     items.forEach(item => {
//       const url = item.href;
//       if (url.includes('file/d/')) {
//         const fileId = url.split('/d/')[1].split('/')[0];
//         links.push(`https://drive.google.com/uc?export=download&id=${fileId}`);
//       }
//     });
//     return links;
//   });

//   await browser.close();

//   return videoLinks;
// }

// // Example Usage:
// const folderUrl = 'https://drive.google.com/drive/folders/YOUR_FOLDER_ID';
// const storageZone = 'your_storage_zone';
// const apiKey = 'your_bunny_cdn_api_key';

// // Scrape the folder and upload all videos
// scrapeGoogleDriveFolder(folderUrl).then(videoURLs => {
//   videoURLs.forEach(url => {
//     uploadVideoFromURL(url, storageZone, apiKey);
//   });
// });
