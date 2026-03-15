import aws_cdk as cdk
import os
from typing_stack import TypingStack

app = cdk.App()

# Pin region to Tokyo
env_JP = cdk.Environment(
    account=os.getenv('CDK_DEFAULT_ACCOUNT'), 
    region='ap-northeast-1'
)

TypingStack(app, "TypingProStack", env=env_JP)

app.synth()
