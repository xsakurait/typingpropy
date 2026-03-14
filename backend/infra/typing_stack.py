from aws_cdk import (
    Stack,
    aws_lambda as _lambda,
    aws_dynamodb as dynamodb,
    aws_apigateway as apigw,
    RemovalPolicy,
)
from constructs import Construct

class TypingStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # DynamoDB Tables
        lessons_table = dynamodb.Table(
            self, "LessonsTable",
            table_name="Lessons",
            partition_key=dynamodb.Attribute(name="id", type=dynamodb.AttributeType.STRING),
            removal_policy=RemovalPolicy.DESTROY, # NOT FOR PRODUCTION
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST
        )

        results_table = dynamodb.Table(
            self, "ResultsTable",
            table_name="TypingResults",
            partition_key=dynamodb.Attribute(name="id", type=dynamodb.AttributeType.STRING),
            removal_policy=RemovalPolicy.DESTROY, # NOT FOR PRODUCTION
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST
        )

        # Lambda Function
        typing_lambda = _lambda.Function(
            self, "TypingFunction",
            runtime=_lambda.Runtime.PYTHON_3_11,
            handler="main.handler",
            code=_lambda.Code.from_asset("../"), # Points to the backend directory
            environment={
                "LESSONS_TABLE": lessons_table.table_name,
                "RESULTS_TABLE": results_table.table_name,
            }
        )

        # Permissions
        lessons_table.grant_read_write_data(typing_lambda)
        results_table.grant_read_write_data(typing_lambda)

        # API Gateway
        api = apigw.RestApi(
            self, "TypingApi",
            rest_api_name="Typing Service",
            description="Typing Pro API Service",
            default_cors_preflight_options=apigw.CorsOptions(
                allow_origins=apigw.Cors.ALL_ORIGINS,
                allow_methods=apigw.Cors.ALL_METHODS
            )
        )

        get_lessons_integration = apigw.LambdaIntegration(typing_lambda)
        api.root.add_proxy(default_integration=get_lessons_integration)
