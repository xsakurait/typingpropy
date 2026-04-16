from aws_cdk import (
    Stack,
    aws_lambda as _lambda,
    aws_dynamodb as dynamodb,
    aws_cognito as cognito,
    RemovalPolicy,
    CfnOutput,
)
from constructs import Construct


class TypingStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # Cognito User Pool
        user_pool = cognito.UserPool(
            self,
            "TypingUserPool",
            user_pool_name="TypingUserPool",
            sign_in_aliases=cognito.SignInAliases(email=True),
            self_sign_up_enabled=True,
            auto_verify=cognito.AutoVerifiedAttrs(email=True),
            removal_policy=RemovalPolicy.DESTROY,
        )

        user_pool_client = user_pool.add_client(
            "TypingUserPoolClient",
            user_pool_client_name="TypingAppClient",
            auth_flows=cognito.AuthFlow(
                user_srp=True, custom=True, admin_user_password=True
            ),
        )

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
            code=_lambda.Code.from_asset("backend"), # Use actual code from backend directory
            environment={
                "LESSONS_TABLE": lessons_table.table_name,
                "RESULTS_TABLE": results_table.table_name,
                "USER_POOL_ID": user_pool.user_pool_id,
                "CLIENT_ID": user_pool_client.user_pool_client_id,
                "REGION": self.region,
            },
        )

        lessons_table.grant_read_write_data(typing_lambda)
        results_table.grant_read_write_data(typing_lambda)

        # Lambda Function URL (Public access, auth checked in code)
        function_url = typing_lambda.add_function_url(
            auth_type=_lambda.FunctionUrlAuthType.NONE,
            cors=_lambda.FunctionUrlCorsOptions(
                allowed_origins=["https://typingpropy.vercel.app", "http://localhost:3000"],
                allowed_methods=[_lambda.HttpMethod.ALL],
                allowed_headers=["*"],
            ),
        )

        CfnOutput(self, "TypingApiUrl", value=function_url.url)
        
