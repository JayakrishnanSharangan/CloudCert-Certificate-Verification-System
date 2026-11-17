# Cloud-Native DevSecOps Pipeline for Certificate Verification System

**Course:** INT: 378 (Advancements in Cloud and DevOps)  
**Institution:** Lovely Professional University, Punjab  
**Author:** Jayakrishnan Sharangan (Reg. No: 12324644 | Section: K4O2311)  
**Supervisor:** Ms. Arshiya  

---

## 📌 Executive Summary

Traditional educational and institutional certificate verification relies on manual checks, paper records, and slow correspondence. This project implements a **Cloud-Native, High-Availability, and Cost-Optimized Certificate Verification Platform** wrapped in a comprehensive **DevSecOps continuous delivery pipeline**.

The project delivers:
1. **Lightweight Full-Stack Application:** React 18 (Vite + Tailwind CSS) frontend and a Node.js Express / AWS Lambda REST API with instant QR-code cryptographic verification.
2. **Mandatory AWS CloudFormation Stack:** Complete Infrastructure as Code (IaC) provisioning Amazon S3, DynamoDB (`PAY_PER_REQUEST` / 100% Free Tier), AWS Lambda, API Gateway v2 HTTP API, IAM Least-Privilege Roles, and CloudWatch Log Groups.
3. **Comparative Terraform Implementation:** Multi-cloud declarative IaC module for architecture and lifecycle comparison against CloudFormation.
4. **14-Stage DevSecOps Jenkins Pipeline:** Automated linting, Jest testing, Trivy container scanning, Checkov IaC security audit, Docker image creation, and automated deployment smoke tests.
5. **Observability & Monitoring:** Embedded Prometheus metrics (`/metrics`) and pre-configured Grafana telemetry dashboards displaying latency, error rates, and verification outcomes.

---

## 🏛️ System Architecture

```
                       +---------------------------------------+
                       |           External Users              |
                       +---------------------------------------+
                                  |                 |
                   Public QR / ID |                 | Admin Token
                     Verification |                 | Management
                                  v                 v
                       +---------------------------------------+
                       |        React Frontend (Vite)          |
                       |    (S3 Static Web Hosting / Nginx)    |
                       +---------------------------------------+
                                           |
                                           | REST API Calls
                                           v
                       +---------------------------------------+
                       |     Amazon API Gateway (HTTP v2)      |
                       +---------------------------------------+
                                           |
                                           v
                       +---------------------------------------+
                       |        AWS Lambda Microservice        |
                       |    (Node.js 20 Serverless Compute)    |
                       +---------------------------------------+
                              |                     |
           Read / Write State |                     | Real-time Telemetry
                              v                     v
                 +-----------------------+   +-------------------+
                 |    Amazon DynamoDB    |   | Amazon CloudWatch |
                 | (Pay-Per-Request Mode)|   |  & Prometheus     |
                 +-----------------------+   +-------------------+
```

---

## 🛠️ Technology Stack Matrix

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide | Administrator dashboard and instant public verification |
| **Backend** | Node.js 20, Express, `serverless-http` | RESTful API and AWS Lambda proxy handler |
| **Database** | Amazon DynamoDB / In-Memory Mock | NoSQL partitioned certificate and audit store |
| **Cloud Hosting** | Amazon S3 + API Gateway HTTP API | Serverless, highly available, low-latency delivery |
| **IaC (Primary)** | **AWS CloudFormation** (`template.yaml`) | AWS-native declarative infrastructure definition |
| **IaC (Comparative)** | **Terraform** (`main.tf`) | Multi-cloud Infrastructure as Code baseline |
| **Containerization** | Docker, Docker Compose | Multi-stage, non-root, reproducible runtime packaging |
| **CI/CD** | Jenkins (`Jenkinsfile`) & GitHub Actions | 14-stage automated DevSecOps validation & deployment |
| **Security Scanning** | Aqua Security Trivy, Checkov, `npm audit` | Container CVE scan, IaC misconfigurations, dependency audit |
| **Monitoring** | Prometheus & Grafana | Telemetry scrape, request rates, latency (P50/P95), and dashboards |

---

## 🚀 Quick Start Guide

### Option 1: Run Locally via Docker Compose (Zero Cloud Setup Required)

Ensure Docker Desktop is running, then execute:

```powershell
# 1. Build and start all 4 services (Backend, Frontend, Prometheus, Grafana)
docker-compose up --build

# 2. Access the services in your browser:
# - Frontend Application:  http://localhost:3000
# - Backend API Health:     http://localhost:5000/health
# - Prometheus Metrics:     http://localhost:5000/metrics
# - Prometheus UI:          http://localhost:9090
# - Grafana Dashboards:     http://localhost:3001 (User: admin | Pass: admin)
```

### Option 2: Run Standalone Without Containers

```powershell
# In terminal 1: Start Backend API
cd backend
npm install
npm start

# In terminal 2: Start Frontend UI
cd frontend
npm install
npm run dev
```

---

## ☁️ AWS CloudFormation Deployment (Mandatory Stack)

The CloudFormation template is located at `cloudformation/template.yaml`.

### 1. Validate Template Syntax
```powershell
aws cloudformation validate-template --template-body file://cloudformation/template.yaml
```

### 2. Deploy Full Serverless Stack
```powershell
# Run the automated deployment script
powershell -ExecutionPolicy Bypass -File ./cloudformation/deploy.ps1
```
Or deploy manually with AWS CLI:
```powershell
aws cloudformation deploy `
    --template-file cloudformation/template.yaml `
    --stack-name cert-verification-stack `
    --parameter-overrides Environment=dev `
    --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM `
    --region us-east-1
```

### 3. Safe Teardown (Zero Free Tier Cost Guarantee)
Once your demonstration or evaluation is complete:
```powershell
powershell -ExecutionPolicy Bypass -File ./cloudformation/delete.ps1
```

---

## 📦 Terraform Comparative Deployment

To demonstrate the comparative analysis between CloudFormation and Terraform:

```powershell
cd terraform
terraform init
terraform fmt -check
terraform validate
terraform plan
# To deploy: terraform apply -auto-approve
# To clean up: terraform destroy -auto-approve
```

---

## 🔄 The 14-Stage DevSecOps Jenkins Pipeline

The project implements the exact 14 delivery stages defined in the INT378 curriculum:

1. **Source-Code Checkout:** Pulls branch from GitHub repository.
2. **Dependency Installation:** Deterministic `npm ci` for backend and frontend.
3. **Code Formatting & Linting:** Codebase static structure checks.
4. **Unit and API Testing:** Automated Jest & Supertest execution verifying all endpoints.
5. **Build Validation:** Production bundle compilation via Vite.
6. **Secret & Dependency Scanning:** `npm audit` and secret detection (DevSecOps "Shift-Left").
7. **Docker Image Creation:** Multi-stage image build using non-root UID.
8. **Container Vulnerability Scanning:** Aqua Security Trivy image CVE scan (`aquasec/trivy`).
9. **Terraform Validation:** Formatting and validation via HashiCorp Terraform CLI.
10. **CloudFormation Template Validation:** Strict structural AWS validation (`validate-template`).
11. **Test-Environment Deployment:** Automated CloudFormation changeset deployment.
12. **API Smoke Testing:** Health check probe (`/health`) verifying operational status.
13. **Manual Approval:** Release manager sign-off checkpoint.
14. **Production Health Check:** Final endpoint verification and Prometheus scrape check.

> **Viva Demo Tip:** The Jenkinsfile includes a parameter `TRIGGER_INTENTIONAL_FAILURE`. When checked, it triggers an intentional test failure to prove that the pipeline halts and refuses to deploy broken code to production.

---

## 📊 Monitoring & Observability

To simulate live traffic and illuminate the Grafana dashboard during your viva:

```powershell
# Run traffic simulation script (sends 30 rapid valid, revoked, and health requests)
powershell -ExecutionPolicy Bypass -File ./security/simulate-traffic.ps1
```

Open Grafana at **`http://localhost:3001`** $\rightarrow$ Navigate to **Dashboards** $\rightarrow$ **Certificate Verification Operations Dashboard**. You will see real-time updates for:
* Total HTTP Request Volume
* Authentic vs Revoked Verifications
* P95 and P50 Response Latency
* System Uptime and HTTP Status Codes

---

## 🎓 Viva Voce Q&A Cheat-Sheet

**Q1: Why choose CloudFormation over Terraform, or vice-versa?**  
*Answer:* CloudFormation is native to AWS, requires no external state file management (AWS maintains state internally), and offers native drift detection and rollbacks. Terraform is platform-agnostic (multi-cloud), uses HashiCorp HCL, and can orchestrate third-party providers (e.g., GitHub, Cloudflare, Datadog) alongside AWS.

**Q2: How does this project prevent unexpected AWS billing?**  
*Answer:* We implemented an event-driven serverless architecture (DynamoDB on-demand, Lambda, API Gateway) which scales to zero when idle. CloudWatch log groups are explicitly limited to a 7-day retention period. No running EC2 instances or NAT Gateways exist. Furthermore, cleanup scripts (`delete.ps1` / `terraform destroy`) tear down resources immediately post-demo.

**Q3: What makes this a "DevSecOps" pipeline instead of just "DevOps"?**  
*Answer:* In standard DevOps, security is audited at the end or post-deployment. In DevSecOps, security is "Shifted Left" into every stage of CI/CD: dependency vulnerabilities are checked at stage 6 (`npm audit`), container base-image CVEs are scanned before registry push at stage 8 (`Trivy`), and IaC misconfigurations are checked before cloud provisioning (`Checkov`).

**Q4: What is the difference between Monitoring and Observability?**  
*Answer:* Monitoring tracks predefined metrics and alerts us *that* something is broken (e.g. Grafana showing high 500 error rates or elevated latency). Observability allows us to infer the internal states of the system and determine *why* it broke using high-cardinality telemetry, request IDs, and structured CloudWatch logs.

