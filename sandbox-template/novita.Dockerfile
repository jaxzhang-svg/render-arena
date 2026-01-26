# Make sure to use this base image
FROM novitalabs/code-interpreter:latest

# Install system dependencies for Playwright
RUN apt-get update && apt-get install -y \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpango-1.0-0 \
    libcairo2 \
    libgdk-pixbuf-2.0-0 \
    libxshmfence1 \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-kacst \
    fonts-freefont-ttf \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20.x
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g npm@latest

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Copy the recording script
COPY scripts/record-app.ts ./scripts/record-app.ts

# Install Playwright browsers
RUN npx playwright install chromium

# Create videos directory
RUN mkdir -p ./scripts/videos

# Set environment variables (NOTE: These are bundled as requested, but consider security implications)
# These will be overwritten if passed during sandbox creation
ENV NEXT_PUBLIC_SUPABASE_URL=""
ENV NEXT_SUPABASE_SERVICE_ROLE_KEY=""
ENV CLOUDFLARE_ACCOUNT_ID=""
ENV CLOUDFLARE_API_TOKEN=""

# Install additional Node.js dependencies
RUN npm install --save-dev tsx dotenv playwright @playwright/test

# Make the script executable
RUN chmod +x ./scripts/record-app.ts

# Set up a simple HTTP server as the start command for service-like behavior
# This allows the sandbox to receive recording requests
EXPOSE 3000

# Copy the server script
COPY scripts/server.js ./scripts/server.js

# Start the recording service server
CMD ["node", "./scripts/server.js"]
