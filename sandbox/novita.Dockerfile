# Novita Sandbox Template with Coding Agent Support
# Base: Node.js 24 slim with essential build tools
FROM node:24-slim

# Install system dependencies (Python for coding agent)
RUN apt-get update && apt-get install -y \
    curl \
    git \
    python3 \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Install uv (fast Python package manager)
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.local/bin:${PATH}"

# Set working directory for the Next.js project
WORKDIR /home/user/app

# Create Next.js 14 app with TypeScript, Tailwind, App Router
RUN npx create-next-app@14.2.33 . \
    --ts \
    --tailwind \
    --eslint \
    --app \
    --import-alias "@/*" \
    --use-npm \
    --no-src-dir

# Install all pre-installed npm packages for Next.js development

# Core UI Libraries
RUN npm install --silent \
    @mui/material \
    @emotion/react \
    @emotion/styled \
    @chakra-ui/react \
    @chakra-ui/icons \
    react-bootstrap \
    antd \
    @blueprintjs/core \
    @radix-ui/react-icons

# State Management
RUN npm install --silent \
    @reduxjs/toolkit \
    react-redux \
    mobx \
    mobx-react-lite \
    jotai \
    recoil \
    zustand

# Data Fetching & API
RUN npm install --silent \
    @tanstack/react-query \
    swr \
    axios \
    ky \
    graphql \
    @apollo/client \
    @trpc/client \
    @trpc/server \
    @trpc/react-query

# Forms & Validation
RUN npm install --silent \
    react-hook-form \
    @hookform/resolvers \
    formik \
    react-final-form \
    zod \
    yup \
    Joi

# Icons
RUN npm install --silent \
    lucide-react \
    @heroicons/react \
    react-icons \
    @radix-ui/react-icons

# Routing & Navigation
RUN npm install --silent \
    react-router-dom \
    next-router-mock \
    next-transpile-modules

# Animation
RUN npm install --silent \
    framer-motion \
    framer-motion-3d \
    @gsap/react \
    auto-animate \
    react-spring \
    use-sound

# 3D & Graphics
RUN npm install --silent \
    three \
    @react-three/fiber \
    @react-three/drei \
    @react-three/postprocessing \
    @react-three/xr

# Physics Engines
RUN npm install --silent \
    @react-three/rapier \
    cannon-es \
    @react-three/cannon \
    matter-js \
    planck-js

# Utilities
RUN npm install --silent \
    lodash \
    clsx \
    tailwind-merge \
    date-fns \
    dayjs \
    luxon \
    immer \
    nanoid \
    uuid \
    @types/uuid

# Charts & Visualization
RUN npm install --silent \
    recharts \
    chart.js \
    react-chartjs-2 \
    visx \
    d3 \
    @types/d3

# Drag & Drop
RUN npm install --silent \
    @dnd-kit/core \
    @dnd-kit/sortable \
    @dnd-kit/utilities \
    react-beautiful-dnd \
    react-grid-layout

# Tables & Data Grid
RUN npm install --silent \
    @tanstack/react-table \
    react-table \
    ag-grid-community \
    ag-grid-react

# Date & Time Pickers
RUN npm install --silent \
    react-datepicker \
    @mui/x-date-pickers \
    react-day-picker

# Markdown & Rich Text
RUN npm install --silent \
    react-markdown \
    @uiw/react-md-editor \
    @tiptap/react \
    @tiptap/starter-kit \
    slate \
    slate-react

# Code Editor
RUN npm install --silent \
    @monaco-editor/react \
    @codemirror/view \
    @codemirror/state \
    @codemirror/lang-javascript

# Authentication
RUN npm install --silent \
    next-auth \
    @auth/prisma-adapter \
    @auth/core

# Database ORM
RUN npm install --silent \
    prisma \
    drizzle-orm \
    @prisma/client

# File Upload
RUN npm install --silent \
    react-dropzone \
    @uppy/core \
    @uppy/react \
    file-saver

# Notifications & Toasts
RUN npm install --silent \
    react-hot-toast \
    sonner \
    react-toastify \
    notistack

# Modals & Dialogs
RUN npm install --silent \
    react-modal \
    @radix-ui/react-dialog

# Virtualization
RUN npm install --silent \
    react-window \
    react-virtual

# Performance & Monitoring
RUN npm install --silent \
    @sentry/nextjs \
    react-intersection-observer \
    react-lazy-load-image-component

# Theme & Styling
RUN npm install --silent \
    next-themes \
    styled-components \
    @emotion/styled \
    @stitches/react

# SEO & Meta
RUN npm install --silent \
    next-seo \
    react-helmet-async

# Maps
RUN npm install --silent \
    @react-google-maps/api \
    react-leaflet \
    leaflet

# PDF & Documents
RUN npm install --silent \
    @react-pdf/renderer \
    react-pdf \
    jspdf \
    html2pdf.js

# Testing
RUN npm install --silent \
    @testing-library/react \
    @testing-library/jest-dom \
    @testing-library/user-event \
    vitest \
    @playwright/test \
    jest \
    @types/jest

# Development Tools
RUN npm install --silent \
    @types/node \
    @types/react \
    @types/react-dom \
    eslint \
    prettier \
    @typescript-eslint/eslint-plugin \
    @typescript-eslint/parser

# Internationalization
RUN npm install --silent \
    next-i18next \
    react-i18next \
    i18next

# Payment
RUN npm install --silent \
    @stripe/stripe-js \
    @stripe/react-stripe-js

# Social Media
RUN npm install --silent \
    react-share \
    react-twitter-embed

# Select & Dropdown
RUN npm install --silent \
    react-select \
    @radix-ui/react-select \
    downshift

# Carousel & Slider
RUN npm install --silent \
    swiper \
    react-slick \
    slick-carousel

# Progress & Loading
RUN npm install --silent \
    @tanstack/react-loaders \
    react-loader-spinner \
    nprogress

# Clipboard
RUN npm install --silent \
    react-clipboard.js \
    use-clipboard-copy

# Media
RUN npm install --silent \
    react-player \
    video.js

# Security
RUN npm install --silent \
    @safe-global/safe-apps-provider \
    @safe-global/safe-apps-sdk

# Analytics
RUN npm install --silent \
    @vercel/analytics \
    google-analytics

# Utility Libraries
RUN npm install --silent \
    axios \
    ky \
    fetch-intercept \
    superagent

# Initialize shadcn with all components for rich UI
RUN npx shadcn@latest init -d -y
RUN npx shadcn@latest add --all -y

# Set up coding agent
WORKDIR /home/user/coding-agent

# Copy coding agent files
COPY coding-agent/pyproject.toml coding-agent/uv.lock ./
COPY coding-agent/src ./src

# Install Python dependencies using uv (only core coding agent dependencies)
RUN uv pip install --system \
    fastapi>=0.128.0 \
    httpx>=0.28.1 \
    pydantic>=2.12.5 \
    python-dotenv>=1.0.0 \
    requests>=2.32.0 \
    uvicorn[standard]>=0.40.0 \
    claude-agent-sdk>=0.1.19

# Set up system prompt for coding agent
RUN mkdir -p ./src/agent/prompts
COPY coding-agent/src/agent/prompts/system_prompt.txt ./src/agent/prompts/

# Create startup script (only start coding agent)
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
echo "Starting Coding Agent API server on port 8000..."\n\
cd /home/user/coding-agent\n\
uvicorn src.main:app --host 0.0.0.0 --port 8000\n\
' > /home/user/start.sh && chmod +x /home/user/start.sh

# Set final working directory for Next.js app
WORKDIR /home/user/app

# Expose port for Next.js dev server
EXPOSE 3000

# Expose port for Coding Agent API
EXPOSE 8000

# Start coding agent server by default
CMD ["/home/user/start.sh"]