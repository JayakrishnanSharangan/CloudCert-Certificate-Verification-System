# CloudFormation Cleanup & Teardown Script (Protects AWS Free Tier)
param (
    [string]$StackName = "cert-verification-stack",
    [string]$Region = "us-east-1"
)

Write-Host "==========================================================" -ForegroundColor Red
Write-Host "Tearing Down CloudFormation Stack to Protect AWS Free Tier" -ForegroundColor Red
Write-Host "Stack Name: $StackName" -ForegroundColor Red
Write-Host "==========================================================" -ForegroundColor Red

# 1. Empty S3 Bucket (CloudFormation cannot delete non-empty buckets)
$BucketName = aws cloudformation describe-stacks `
    --stack-name $StackName `
    --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketWebsiteUrl'].OutputValue" `
    --output text `
    --region $Region 2>$null

if ($BucketName -match "http://(.*)\.s3") {
    $RealBucket = $Matches[1]
    Write-Host "Emptying S3 bucket $RealBucket..." -ForegroundColor Yellow
    aws s3 rm "s3://$RealBucket" --recursive --region $Region
}

# 2. Delete Stack
Write-Host "Deleting CloudFormation Stack..." -ForegroundColor Yellow
aws cloudformation delete-stack --stack-name $StackName --region $Region

Write-Host "Waiting for stack deletion to complete..." -ForegroundColor Yellow
aws cloudformation wait stack-delete-complete --stack-name $StackName --region $Region

Write-Host "All cloud resources destroyed. Zero ongoing AWS charges!" -ForegroundColor Green

