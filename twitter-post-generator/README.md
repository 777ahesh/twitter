# Twitter Post Generator

## Overview
The Twitter Post Generator is a full-stack application that allows users to generate tweets based on user-defined topics or random articles from the dev.to platform. The application leverages the Hugging Face API for generating human-like tweets and integrates with the X (formerly Twitter) API to post the generated tweets.

## Project Structure
The project is divided into two main parts: the client (React) and the server (Express).

```
twitter-post-generator
├── client
│   ├── public
│   │   └── index.html
│   ├── src
│   │   ├── components
│   │   │   ├── TweetGenerator.jsx
│   │   │   ├── TweetPreview.jsx
│   │   │   └── PostButton.jsx
│   │   ├── services
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.js
│   └── package.json
├── server
│   ├── src
│   │   ├── controllers
│   │   │   ├── tweetController.js
│   │   │   └── devToController.js
│   │   ├── routes
│   │   │   ├── tweets.js
│   │   │   └── devto.js
│   │   ├── services
│   │   │   ├── huggingFaceService.js
│   │   │   ├── devToService.js
│   │   │   └── twitterService.js
│   │   ├── middleware
│   │   │   └── auth.js
│   │   ├── config
│   │   │   └── database.js
│   │   └── app.js
│   ├── package.json
│   └── .env
├── .gitignore
└── README.md
```

## Features
- **Tweet Generation**: Users can input a topic or context, and the application will generate a tweet using the Hugging Face API.
- **Random Article Tweets**: Users can fetch random articles from the dev.to public API and generate tweets based on those articles.
- **Tweet Preview**: The generated tweet is displayed in a preview section before posting.
- **Post to X Account**: Users can post the generated tweet directly to their X account.

## Setup Instructions

### Prerequisites
- Node.js and npm installed on your machine.
- An account on Hugging Face to obtain an API key.
- An account on X (Twitter) to obtain API credentials.

### Client Setup
1. Navigate to the `client` directory:
   ```
   cd client
   ```
2. Install the required dependencies:
   ```
   npm install
   ```
3. Start the React application:
   ```
   npm start
   ```

### Server Setup
1. Navigate to the `server` directory:
   ```
   cd server
   ```
2. Create a `.env` file in the `server` directory and add your API keys:
   ```
   HUGGING_FACE_API_KEY=your_hugging_face_api_key
   TWITTER_API_KEY=your_twitter_api_key
   TWITTER_API_SECRET=your_twitter_api_secret
   TWITTER_ACCESS_TOKEN=your_twitter_access_token
   TWITTER_ACCESS_TOKEN_SECRET=your_twitter_access_token_secret
   ```
3. Install the required dependencies:
   ```
   npm install
   ```
4. Start the Express server:
   ```
   npm start
   ```

## Usage
- Open the React application in your browser (usually at `http://localhost:3000`).
- Enter a topic in the input box to generate a tweet or click to fetch a random article.
- Review the generated tweet in the preview section.
- Click the "Post" button to send the tweet to your X account.

## Contributing
Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.