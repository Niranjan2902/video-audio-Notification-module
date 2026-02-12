const path = require('path');
const express = require('express');
const multer = require('multer');
const ffmpegPath = require('ffmpeg-static');
const { exec } = require('child_process');
const fs = require('fs');
const app = express();
const PORT = 8080;
const cors = require("cors");

app.use(cors()); 

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = './LocalFileStore';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// File filter and size limit configuration
const upload = multer({
  storage: storage,
  limits: { fileSize: 400 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);  
    }else if (file.mimetype.startsWith('audio/')) {
      cb(null, true);  
    }
    else {
      cb(new Error("Incorrect video Type."), false);
    }
  }
});

// Serve static files (HLS segments)
app.use(express.static(path.join(__dirname, 'LocalFileStore')));
//app.use(express.static(path.join(__dirname, 'output'))); INCORRECT PATH
app.use("/videos",express.static(path.join(__dirname, 'output')));

// UPLOAD video
app.get("/", (req, res) => {
  res.json("Test api");
});

app.post("/upload", upload.single('file'), (req, res) => {
  console.log("Form Data:", req.body);
  console.log("Uploaded File:", req.file); 

  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  // Get the file path of the uploaded video
  const inputFilePath = path.resolve(__dirname, 'LocalFileStore', req.file.filename);  
  console.log('Input file path:', inputFilePath);  

  // OUTPUT CHUNKS VIDEO
  if (!fs.existsSync(inputFilePath)) {
    console.error(`File does not exist at path: ${inputFilePath}`);
    return res.status(500).send("Error: File not found.");
  }

  const outputFolder = path.join(__dirname, 'output', req.file.filename.split('.')[0]);

  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
  }

  // FFmpeg command to convert the uploaded video to HLS format
try {
    const file = req.file;
    const title = req.body.title || file?.originalname;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    //IMAGE 
    if (file.mimetype.startsWith("video/")) {
    
      const command = `${ffmpegPath} -i "${inputFilePath}"
 -preset veryfast -g 48 -sc_threshold 0
 -c:a aac -b:a 128k -f hls -hls_time 3 
 -hls_playlist_type vod -hls_flags independent_segments
 -hls_segment_filename "${outputFolder}/segment_%03d.aac" "${outputFolder}/master.m3u8"`;


console.log("Executing FFmpeg command:", command);

    exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error("FFmpeg execution error:", error.message);
    console.error("Command:", command);
    console.error("Error details:", stderr);
    return res.status(500).send("Error processing video.");
  }

  if (stderr) {
    console.error("FFmpeg stderr:", stderr); 
  }

  console.log("FFmpeg stdout:", stdout);  // Log the output to check FFmpeg progress

  res.redirect(`/videos/${req.file.filename.split('.')[0]}`);
})
    }

    //VIDEO
    if (file.mimetype.startsWith("audio/")) {
    
      const command = `${ffmpegPath} -i "${inputFilePath}"
 -preset veryfast -g 48 -sc_threshold 0 
-map 0:v:0 -map 0:a:0 -s:v:0 854x480 -b:v:0 800k -c:v libx264 -c:a aac -f hls -hls_time 3 
-hls_playlist_type vod -hls_flags independent_segments 
-hls_segment_filename "${outputFolder}/segment_%03d.ts" "${outputFolder}/master.m3u8"`;

console.log("Executing FFmpeg command:", command);

    exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error("FFmpeg execution error:", error.message);
    console.error("Command:", command);
    console.error("Error details:", stderr);
    return res.status(500).send("Error processing audio.");
  }

  if (stderr) {
    console.error("FFmpeg stderr:", stderr); 
  }

  console.log("FFmpeg stdout:", stdout);  // Log the output to check FFmpeg progress

  res.redirect(`/audios/${req.file.filename.split('.')[0]}`);
})
    }

    res.status(400).json({ error: "Unsupported file type" });
  } catch (err) {
    console.error("Upload error:", err.message);
    res.status(500).json({ error: err.message });
  }


});


//   try {
//     const file = req.file;
//     const title = req.body.title || file?.originalname;
//     if (!file) return res.status(400).json({ error: "No file uploaded" });

//     //IMAGE 
//     if (file.mimetype.startsWith("video/")) {
    
//       const command = `${ffmpegPath} -i "${inputFilePath}"
//  -preset veryfast -g 48 -sc_threshold 0
//  -c:a aac -b:a 128k -f hls -hls_time 3 
//  -hls_playlist_type vod -hls_flags independent_segments
//  -hls_segment_filename "${outputFolder}/segment_%03d.aac" "${outputFolder}/master.m3u8"`;


// console.log("Executing FFmpeg command:", command);

//     exec(command, (error, stdout, stderr) => {
//   if (error) {
//     console.error("FFmpeg execution error:", error.message);
//     console.error("Command:", command);
//     console.error("Error details:", stderr);
//     return res.status(500).send("Error processing video.");
//   }

//   if (stderr) {
//     console.error("FFmpeg stderr:", stderr); 
//   }

//   console.log("FFmpeg stdout:", stdout);  // Log the output to check FFmpeg progress

//   res.redirect(`/videos/${req.file.filename.split('.')[0]}`);
// })
//     }

//     //VIDEO
//     if (file.mimetype.startsWith("audio/")) {
    
//       const command = `${ffmpegPath} -i "${inputFilePath}"
//  -preset veryfast -g 48 -sc_threshold 0 
// -map 0:v:0 -map 0:a:0 -s:v:0 854x480 -b:v:0 800k -c:v libx264 -c:a aac -f hls -hls_time 3 
// -hls_playlist_type vod -hls_flags independent_segments 
// -hls_segment_filename "${outputFolder}/segment_%03d.ts" "${outputFolder}/master.m3u8"`;

// console.log("Executing FFmpeg command:", command);

//     exec(command, (error, stdout, stderr) => {
//   if (error) {
//     console.error("FFmpeg execution error:", error.message);
//     console.error("Command:", command);
//     console.error("Error details:", stderr);
//     return res.status(500).send("Error processing audio.");
//   }

//   if (stderr) {
//     console.error("FFmpeg stderr:", stderr); 
//   }

//   console.log("FFmpeg stdout:", stdout);  // Log the output to check FFmpeg progress

//   res.redirect(`/audios/${req.file.filename.split('.')[0]}`);
// })
//     }

//     res.status(400).json({ error: "Unsupported file type" });
//   } catch (err) {
//     console.error("Upload error:", err.message);
//     res.status(500).json({ error: err.message });
//   }



// Route to render video player and HLS stream
app.get("/videos/:videoId", (req, res) => {
  const videoId = req.params.videoId;
  const videoPath = path.join('output', videoId, 'master.m3u8');
  
  // Check if the master.m3u8 file exists
  if (!fs.existsSync(videoPath)) {
    return res.status(404).send("Video not found.");
  }

  // Render the player page
  const videoPath1=`/videos/${videoId}/master.m3u8`;
 
  //res.render("player", { videoPath: `/videos/${videoId}/master.m3u8` });
  console.log(videoPath1)
  res.json(videoPath1);
});

app.get("/audio/:audioId", (req, res) => {
  const audioId = req.params.videoId;
  const videoPath = path.join('output', audioId, 'master.m3u8');
  
  // Check if the master.m3u8 file exists
  if (!fs.existsSync(videoPath)) {
    return res.status(404).send("Video not found.");
  }

  // Render the player page
  const audioPath1=`/audio/${audioId}/master.m3u8`;
 
  //res.render("player", { videoPath: `/videos/${videoId}/master.m3u8` });
  console.log(audioPath1)
  res.json(audioPath1);
});

app.get("/listvideos", (req, res) => {
  const videosDir = path.join(__dirname, 'output');
  
  fs.readdir(videosDir, (err, files) => {
    if (err) {
      return res.status(500).send("Error reading video directories.");
    }
    
    // Filter out non-directory items (we want only video folders)
    const videoDirs = files.filter(file => fs.statSync(path.join(videosDir, file)).isDirectory());

    if (videoDirs.length === 0) {
      return res.status(404).send("No videos found.");
    }

    res.json(videoDirs);  // This should be a JSON array of video directory names
  });
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});


