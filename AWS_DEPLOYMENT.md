# Onuvuti AWS Production Deployment Guide

This guide covers deploying the **Onuvuti Go Backend** on AWS with **Amazon RDS (PostgreSQL)**.

---

## 1. Architecture Overview

- **Database:** Amazon RDS PostgreSQL (db.t4g.micro or db.t4g.small, Multi-AZ optional).
- **Backend Compute Options on AWS:**
  - **Option A (Recommended - Easiest & Managed):** **AWS App Runner** (Direct Docker deployment with automatic HTTPS, SSL, and load balancing).
  - **Option B (Containerized Scalable):** **AWS ECS with Fargate** (Serverless containers behind an Application Load Balancer).
  - **Option C (Simple Virtual Server):** **AWS EC2 Ubuntu Instance** (Docker Compose with Nginx reverse proxy).

---

## 2. Setting Up Amazon RDS (PostgreSQL)

1. Go to **AWS Console** -> **RDS** -> **Create Database**.
2. Select **PostgreSQL** (version 16 or 15).
3. Template: **Free tier** (or Production for higher traffic).
4. Settings:
   - **DB instance identifier:** `onuvuti-postgres`
   - **Master username:** `onuvuti_admin`
   - **Master password:** `your_strong_password`
5. Connectivity:
   - **VPC Security Group:** Allow Inbound traffic on port `5432` from your App Runner / ECS security group (or `0.0.0.0/0` if testing publicly with strong password).
6. Database options:
   - **Initial database name:** `onuvuti`
7. Once created, copy the **Endpoint**, e.g.:
   `onuvuti-postgres.cxxxxxx.us-east-1.rds.amazonaws.com`
8. Construct your connection string:
   ```
   DATABASE_URL=postgres://onuvuti_admin:your_strong_password@onuvuti-postgres.cxxxxxx.us-east-1.rds.amazonaws.com:5432/onuvuti?sslmode=require
   ```

---

## 3. Deployment Option A: AWS App Runner (Fastest & Managed)

1. **Build and push image to AWS ECR:**
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <YOUR_AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com

   aws ecr create-repository --repository-name onuvuti-backend --region us-east-1

   docker build -t onuvuti-backend ./backend
   docker tag onuvuti-backend:latest <YOUR_AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/onuvuti-backend:latest
   docker push <YOUR_AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/onuvuti-backend:latest
   ```

2. **Create App Runner Service:**
   - In AWS Console -> **App Runner** -> **Create Service**.
   - Select **Container registry** -> **Amazon ECR**.
   - Select `<YOUR_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/onuvuti-backend:latest`.
   - Set Port to `8081`.
   - Add Environment Variables:
     - `PORT=8081`
     - `DATABASE_URL=postgres://...`
     - `ADMIN_PASSWORD=...`
     - `ADMIN_TOKEN_SECRET=...`
     - `CORS_ALLOWED_ORIGINS=https://onuvuti.site,https://www.onuvuti.site`
   - Health check path: `/api/v1/health`
3. Click **Create & Deploy**. AWS App Runner gives you an automated HTTPS URL (e.g. `https://xxxxxx.us-east-1.awsapprunner.com`)!

---

## 4. Deployment Option C: AWS EC2 (Docker Compose)

1. Launch an Ubuntu 24.04 EC2 instance (`t3.micro` or `t3.small`).
2. Security Group: Open ports `22` (SSH), `80` (HTTP), `443` (HTTPS), and `8081` (optional or proxied via Nginx).
3. SSH into your instance:
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```
4. Install Docker & Docker Compose:
   ```bash
   sudo apt update && sudo apt install -y docker.io docker-compose-plugin git
   sudo usermod -aG docker ubuntu
   ```
5. Clone repository and run:
   ```bash
   git clone https://github.com/your-username/Onuvuti.git
   cd Onuvuti/backend
   cp .env.production.example .env
   # Edit .env with your RDS URL and secrets
   nano .env
   docker compose up -d --build
   ```
6. Check health:
   ```bash
   curl http://localhost:8081/api/v1/health
   ```

---

## 5. Connecting Frontend to AWS Backend

In your Next.js frontend deployment (Vercel / Amplify):
Add environment variable:
```
NEXT_PUBLIC_GO_API_URL=https://your-aws-backend-domain.com/api/v1
```
And the frontend will automatically direct all story submissions, reactions, comments, tracking, user auth, and analytics to your AWS Go backend!

