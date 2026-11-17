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
Write-Host "[1/5] Packaging backend Lambda artifact..." -ForegroundColor Yellow
$LambdaZip = "$PSScriptRoot\lambda-deployment.zip"
if (Test-Path $LambdaZip) { Remove-Item $LambdaZip -Force }

Compress-Archive -Path "$PSScriptRoot\..\backend\src\*", "$PSScriptRoot\..\backend\node_modules" -DestinationPath $LambdaZip

# 2. Deploy CloudFormation Stack
Write-Host "[2/5] Executing CloudFormation deployment..." -ForegroundColor Yellow
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
Write-Host "[3/5] Updating Lambda function with backend code..." -ForegroundColor Yellow
$FunctionName = "cert-verification-api-$Environment"
aws lambda update-function-code `
    --function-name $FunctionName `
    --zip-file "fileb://$LambdaZip" `
    --region $Region

# 4. Sync Frontend to S3 Bucket
Write-Host "[4/5] Uploading compiled React frontend to S3 website bucket..." -ForegroundColor Yellow
$ApiEndpoint = aws cloudformation describe-stacks `
    --stack-name $StackName `
    --query "Stacks[0].Outputs[?OutputKey=='ApiEndpointUrl'].OutputValue" `
    --output text `
    --region $Region

$WebsiteUrl = aws cloudformation describe-stacks `
    --stack-name $StackName `
    --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketWebsiteUrl'].OutputValue" `
    --output text `
    --region $Region

if ($WebsiteUrl -match "http://([^.]+)\.s3") {
    $BucketName = $Matches[1]
    Write-Host "Target S3 Bucket: $BucketName" -ForegroundColor Cyan
    
    # Re-build frontend with production API URL
    $env:VITE_API_URL = $ApiEndpoint
    Set-Location "$PSScriptRoot\..\frontend"
    npm run build
    
    # Sync dist to S3
    aws s3 sync dist/ "s3://$BucketName" --delete --region $Region
    Set-Location $PSScriptRoot
}

# 5. Output Results
Write-Host "[5/5] Fetching stack endpoints..." -ForegroundColor Green
aws cloudformation describe-stacks `
    --stack-name $StackName `
    --query "Stacks[0].Outputs" `
    --output table `
    --region $Region

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "Deployment Completed Successfully!" -ForegroundColor Green
Write-Host "Public Website: $WebsiteUrl" -ForegroundColor Green
Write-Host "API Gateway:    $ApiEndpoint" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
