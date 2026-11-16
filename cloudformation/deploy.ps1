# CloudFormation Deployment Script
param (
    [string]$StackName = "cert-verification-stack",
    [string]$Environment = "dev",
    [string]$Region = "us-east-1"
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Deploying CloudFormation Stack: $StackName ($Environment)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Package backend zip for Lambda
Write-Host "[1/4] Packaging backend Lambda artifact..." -ForegroundColor Yellow
$LambdaZip = "$PSScriptRoot\lambda-deployment.zip"
if (Test-Path $LambdaZip) { Remove-Item $LambdaZip -Force }

Compress-Archive -Path "$PSScriptRoot\..\backend\src\*", "$PSScriptRoot\..\backend\node_modules" -DestinationPath $LambdaZip

# 2. Deploy CloudFormation Stack
Write-Host "[2/4] Executing CloudFormation deployment..." -ForegroundColor Yellow
aws cloudformation deploy `
    --template-file "$PSScriptRoot\template.yaml" `
    --stack-name $StackName `
    --parameter-overrides Environment=$Environment `
    --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM `
    --region $Region

if ($LASTEXITCODE -ne 0) {
    Write-Error "CloudFormation deployment encountered an issue."
    exit $LASTEXITCODE
}

# 3. Update Lambda with packaged code
Write-Host "[3/4] Updating Lambda function with backend code..." -ForegroundColor Yellow
$FunctionName = "cert-verification-api-$Environment"
aws lambda update-function-code `
    --function-name $FunctionName `
    --zip-file "fileb://$LambdaZip" `
    --region $Region

# 4. Describe Outputs
Write-Host "[4/4] Fetching stack outputs..." -ForegroundColor Green
aws cloudformation describe-stacks `
    --stack-name $StackName `
    --query "Stacks[0].Outputs" `
    --output table `
    --region $Region

Write-Host "Deployment completed successfully!" -ForegroundColor Green

