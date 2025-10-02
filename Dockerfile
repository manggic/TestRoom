# Step 1: Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

# Build-time env variables
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_KEY
ARG VITE_ADMIN_EMAIL
ARG VITE_ADMIN_PASSWORD
ARG VITE_STUDENT_EMAIL
ARG VITE_STUDENT_PASSWORD
ARG VITE_TEACHER_EMAIL
ARG VITE_TEACHER_PASSWORD

ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_KEY=${VITE_SUPABASE_KEY}
ENV VITE_ADMIN_EMAIL=${VITE_ADMIN_EMAIL}
ENV VITE_ADMIN_PASSWORD=${VITE_ADMIN_PASSWORD}
ENV VITE_STUDENT_EMAIL=${VITE_STUDENT_EMAIL}
ENV VITE_STUDENT_PASSWORD=${VITE_STUDENT_PASSWORD}
ENV VITE_TEACHER_EMAIL=${VITE_TEACHER_EMAIL}
ENV VITE_TEACHER_PASSWORD=${VITE_TEACHER_PASSWORD}

# Build the app
RUN npm run build

# Step 2: Production stage (Nginx)
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

