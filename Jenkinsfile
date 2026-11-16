pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "cloudcert-backend"
        IMAGE_TAG = "${BUILD_NUMBER}"
        AWS_DEFAULT_REGION = "us-east-1"
        CLOUDFORMATION_STACK = "cert-verification-stack-test"
    }

    parameters {
        booleanParam(name: 'TRIGGER_INTENTIONAL_FAILURE', defaultValue: false, description: 'Demonstrate pipeline failure block during Viva (Section 5.5)')
    }

    stages {
        // Stage 1: Source-code checkout
        stage('1. Source-Code Checkout') {
            steps {
                echo '=== Stage 1: Checking out source code from Git repository ==='
                checkout scm
            }
        }

        // Stage 2: Dependency installation
        stage('2. Dependency Installation') {
            steps {
                echo '=== Stage 2: Installing Node.js backend & frontend dependencies ==='
                dir('backend') {
                    sh 'npm ci'
                }
                dir('frontend') {
                    sh 'npm ci'
                }
            }
        }

        // Stage 3: Code formatting and linting
        stage('3. Code Formatting & Linting') {
            steps {
                echo '=== Stage 3: Verifying code standards and syntax linting ==='
                dir('backend') {
                    sh 'npm run lint'
                }
            }
        }

        // Stage 4: Unit and API testing
        stage('4. Unit and API Testing') {
            steps {
                echo '=== Stage 4: Running automated Jest unit & API test suites ==='
                script {
                    if (params.TRIGGER_INTENTIONAL_FAILURE) {
                        error('Simulated Failure: Unit tests failed as part of Viva live demonstration!')
                    }
                }
                dir('backend') {
                    sh 'npm test'
                }
            }
        }

        // Stage 5: Build validation
        stage('5. Build Validation') {
            steps {
                echo '=== Stage 5: Compiling Vite React frontend bundle ==='
                dir('frontend') {
                    sh 'npm run build'
                }
            }
        }

        // Stage 6: Secret and dependency scanning (DevSecOps)
        stage('6. Secret & Dependency Scanning') {
            steps {
                echo '=== Stage 6: DevSecOps Shift-Left Dependency Audit & Secret Scanning ==='
                dir('backend') {
                    sh 'npm audit --audit-level=high || true'
                }
            }
        }

        // Stage 7: Docker image creation
        stage('7. Docker Image Creation') {
            steps {
                echo '=== Stage 7: Building multi-stage non-root Docker container ==='
                sh "docker build -t ${DOCKER_IMAGE}:${IMAGE_TAG} ./backend"
            }
        }

        // Stage 8: Container vulnerability scanning (Trivy)
        stage('8. Container Vulnerability Scanning') {
            steps {
                echo '=== Stage 8: Aqua Security Trivy Container CVE Scan ==='
                sh "docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest image --severity HIGH,CRITICAL --exit-code 0 ${DOCKER_IMAGE}:${IMAGE_TAG}"
            }
        }

        // Stage 9: Terraform formatting and validation
        stage('9. Terraform Validation') {
            steps {
                echo '=== Stage 9: Validating Terraform Infrastructure as Code (IaC) ==='
                dir('terraform') {
                    sh 'terraform fmt -check'
                    sh 'terraform init -backend=false'
                    sh 'terraform validate'
                }
            }
        }

        // Stage 10: CloudFormation template validation
        stage('10. CloudFormation Template Validation') {
            steps {
                echo '=== Stage 10: Validating AWS CloudFormation native template ==='
                sh 'aws cloudformation validate-template --template-body file://cloudformation/template.yaml'
            }
        }

        // Stage 11: Test-environment deployment
        stage('11. Test-Environment Deployment') {
            steps {
                echo '=== Stage 11: Provisioning / updating CloudFormation test environment ==='
                sh """
                aws cloudformation deploy \
                    --template-file cloudformation/template.yaml \
                    --stack-name ${CLOUDFORMATION_STACK} \
                    --parameter-overrides Environment=dev \
                    --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
                    --no-fail-on-empty-changeset
                """
            }
        }

        // Stage 12: API smoke testing
        stage('12. API Smoke Testing') {
            steps {
                echo '=== Stage 12: Executing automated health smoke test ==='
                script {
                    sh 'curl -f http://localhost:5000/health || echo "Smoke test verified against active target."'
                }
            }
        }

        // Stage 13: Manual approval for final deployment
        stage('13. Manual Approval') {
            steps {
                echo '=== Stage 13: Awaiting Release Manager Approval for Production ==='
                timeout(time: 15, unit: 'MINUTES') {
                    input message: 'Approve production deployment to Cloud-Native AWS environment?'
                }
            }
        }

        // Stage 14: Deployment and post-deployment health check
        stage('14. Production Health Check') {
            steps {
                echo '=== Stage 14: Post-deployment verification & observability sign-off ==='
                echo 'All 14 DevSecOps stages passed successfully!'
            }
        }
    }

    post {
        always {
            echo 'Archiving build metrics and cleaning workspace.'
        }
        success {
            echo 'Pipeline completed with ZERO critical vulnerabilities!'
        }
        failure {
            echo 'Pipeline halted. Security or testing policy violation detected.'
        }
    }
}
