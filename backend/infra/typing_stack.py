from aws_cdk import (
    Stack,
    aws_lambda as _lambda,
    aws_dynamodb as dynamodb,
    aws_apigateway as apigw,
    RemovalPolicy,
    CfnOutput,
)
from constructs import Construct


class TypingStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        lessons_table = dynamodb.Table(
            self,
            "LessonsTable",
            table_name="Lessons",
            partition_key=dynamodb.Attribute(
                name="id", type=dynamodb.AttributeType.STRING
            ),
            removal_policy=RemovalPolicy.DESTROY,
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
        )

        results_table = dynamodb.Table(
            self,
            "ResultsTable",
            table_name="TypingResults",
            partition_key=dynamodb.Attribute(
                name="id", type=dynamodb.AttributeType.STRING
            ),
            removal_policy=RemovalPolicy.DESTROY,
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
        )

        typing_lambda = _lambda.Function(
            self,
            "TypingFunction",
            function_name="TypingProFunction",
            runtime=_lambda.Runtime.PYTHON_3_11,
            handler="main.handler",
            code=_lambda.Code.from_inline(
                "import json\ndef handler(event, context):\n    return {'statusCode': 200, 'body': json.dumps('Initial deploy')}"
            ),
            environment={
                "LESSONS_TABLE": lessons_table.table_name,
                "RESULTS_TABLE": results_table.table_name,
            },
        )

        lessons_table.grant_read_write_data(typing_lambda)
        results_table.grant_read_write_data(typing_lambda)

        # api = apigw.RestApi(
        #     self, "TypingApi",
        #     rest_api_name="Typing Service",
        #     description="Typing Pro API Service",
        #     default_cors_preflight_options=apigw.CorsOptions(
        #         allow_origins=apigw.Cors.ALL_ORIGINS,
        #         allow_methods=apigw.Cors.ALL_METHODS
        #     )
        # )
        # api.root.add_proxy(default_integration=get_lessons_integration)
        function_url = typing_lambda.add_function_url(
            auth_type=_lambda.FunctionUrlAuthType.NONE,
            cors=_lambda.FunctionUrlCorsOptions(
                allowed_origins=["https://typingpropy.vercel.app"],
                allowed_methods=[_lambda.HttpMethod.ALL],
                allowed_headers=["*"],
            ),
        )

        CfnOutput(self, "TypingApiUrl", value=function_url.url)

        get_lessons_integration = apigw.LambdaIntegration(typing_lambda)
