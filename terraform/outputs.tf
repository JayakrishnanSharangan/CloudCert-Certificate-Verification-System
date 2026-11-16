output "dynamodb_table_name" {
  description = "DynamoDB table name"
  value       = aws_dynamodb_table.cert_table.name
}

output "api_endpoint" {
  description = "HTTP API Gateway endpoint URL"
  value       = aws_apigatewayv2_api.http_api.api_endpoint
}

output "frontend_website_url" {
  description = "S3 static website hosting URL"
  value       = aws_s3_bucket_website_configuration.frontend_website.website_endpoint
}

