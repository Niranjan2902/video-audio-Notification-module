const path = require('path');
const express = require('express');
const multer = require('multer');
const ffmpegPath = require('ffmpeg-static');
const { exec } = require('child_process');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 8080;

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
  limits: { fileSize: 400 * 1024 * 1024 },  // 400 MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);  // Allow video files
    } else if (file.mimetype.startsWith('audio/')) {
      cb(null, true);  // Allow audio files
    } else {
      cb(new Error("Unsupported file type"), false);  // Reject other file types
    }
  }
});

// Serve static files (HLS segments)
app.use(express.static(path.join(__dirname, 'LocalFileStore')));
app.use("/videos", express.static(path.join(__dirname, 'output')));

// Upload endpoint
app.post("/upload", upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  // Get the file path of the uploaded video
  const inputFilePath = path.resolve(__dirname, 'LocalFileStore', req.file.filename);
  console.log('Input file path:', inputFilePath);

  if (!fs.existsSync(inputFilePath)) {
    console.error(`File does not exist at path: ${inputFilePath}`);
    return res.status(500).send("Error: File not found.");
  }

  const outputFolder = path.join(__dirname, 'output', req.file.filename.split('.')[0]);

  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
  }

  // Check if the file is video or audio and process accordingly
  const file = req.file;
  const title = req.body.title || file.originalname;
  
  if (file.mimetype.startsWith('video/')) {
    // FFmpeg command for video file
    const command = `${ffmpegPath} -i "${inputFilePath}" -preset veryfast -g 48 -sc_threshold 0 -c:v libx264 -c:a aac -f hls -hls_time 3 -hls_playlist_type vod -hls_flags independent_segments -hls_segment_filename "${outputFolder}/segment_%03d.ts" "${outputFolder}/master.m3u8"`;
    console.log("Executing FFmpeg command:", command);

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("FFmpeg execution error:", error.message);
        return res.status(500).send("Error processing video.");
      }

      if (stderr) {
        console.error("FFmpeg stderr:", stderr);
      }

      console.log("FFmpeg stdout:", stdout);
      res.json(`/videos/${req.file.filename.split('.')[0]}`);
    });

  } else if (file.mimetype.startsWith('audio/')) {
    
    // FFmpeg command for audio file (if applicable)
    const command = `${ffmpegPath} -i "${inputFilePath}" -preset veryfast -c:a aac -f hls -hls_time 3 -hls_playlist_type vod -hls_flags independent_segments -hls_segment_filename "${outputFolder}/segment_%03d.ts" "${outputFolder}/master.m3u8"`;
    console.log("Executing FFmpeg command:", command);

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("FFmpeg execution error:", error.message);
        return res.status(500).send("Error processing audio.");
      }

      if (stderr) {
        console.error("FFmpeg stderr:", stderr);
      }

      console.log("FFmpeg stdout:", stdout);
      res.json(`/audios/${req.file.filename.split('.')[0]}`);
    });

  } else {
    return res.status(400).json({ error: "Unsupported file type" });
  }
});

// Route to render video player and HLS stream
app.get("/videos/:videoId", (req, res) => {
  const videoId = req.params.videoId;
  const videoPath = path.join(__dirname, 'output', videoId, 'master.m3u8');

  if (!fs.existsSync(videoPath)) {
    return res.status(404).send("Video not found.");
  }

  const videoPath1 = `/videos/${videoId}/master.m3u8`;
  res.json(videoPath1);
});

// Route to render audio player and HLS stream
app.get("/audio/:audioId", (req, res) => {
  const audioId = req.params.audioId;
  const audioPath = path.join(__dirname, 'output', audioId, 'master.m3u8');

  if (!fs.existsSync(audioPath)) {
    return res.status(404).send("Audio not found.");
  }

  const audioPath1 = `/audio/${audioId}/master.m3u8`;
  res.json(audioPath1);
});

// List all videos
app.get("/listvideos", (req, res) => {
  const videosDir = path.join(__dirname, 'output');
  fs.readdir(videosDir, (err, files) => {
    if (err) {
      return res.status(500).send("Error reading video directories.");
    }

    const videoDirs = files.filter(file => fs.statSync(path.join(videosDir, file)).isDirectory());
    if (videoDirs.length === 0) {
      return res.status(404).send("No videos found.");
    }

    res.json(videoDirs);
  });
});

app.get("/listaudios", (req, res) => {
  const audioDir = path.join(__dirname, 'output');
  fs.readdir(audioDir, (err, files) => {
    if (err) {
      return res.status(500).send("Error reading audio directories.");
    }
    const audioDirs = files.filter(file => {
      const filePath = path.join(audioDir, file);
      return fs.statSync(filePath).isDirectory() && fs.existsSync(path.join(filePath, 'master.m3u8'));
    });

    if (audioDirs.length === 0) {
      return res.status(404).send("No audio files found.");
    }
    res.json(audioDirs);  // Return the audio directories containing audio files
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});




