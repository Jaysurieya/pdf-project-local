# Environment Variables Setup

This project uses environment variables to securely store sensitive information like API keys.

## Setup Instructions

1. **Create your `.env` file:**
   Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. **Get your Google Gemini API Key:**
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create a new API key
   - Copy the key to your clipboard

3. **Update the `.env` file:**
   Replace the placeholder value with your actual API key:
   ```env
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

## Available Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_GEMINI_API_KEY` | ✅ Yes | Google Gemini API key for AI assistant functionality |
| `NODE_ENV` | No | Environment mode (development/production) |

## Security Notes

- ✅ The `.env` file is automatically ignored by git (added to `.gitignore`)
- ✅ Only variables prefixed with `VITE_` are exposed to the client-side code
- ✅ Never commit your `.env` file to version control
- ✅ Use `.env.example` as a template for other developers

## Development vs Production

For production deployment, create a `.env.production` file with your production API keys.

## Troubleshooting

If you see "Gemini API key is missing" errors:
1. Verify your `.env` file exists in the frontend directory
2. Check that `VITE_GEMINI_API_KEY` is properly set
3. Restart your development server after making changes
4. Ensure there are no extra spaces or quotes around the API key value