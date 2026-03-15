import aws_cdk as cdk
import os
from typing_stack import TypingStack

app = cdk.App()

# Pin region to Tokyo
env_JP = cdk.Environment(
    account=os.getenv('CDK_DEFAULT_ACCOUNT'), 
    region='ap-northeast-1'
)

# Use a synthesizer that doesn't require the CDK Bootstrap stack
# This avoids the creation of an S3 bucket for assets.
synthesizer = cdk.CliCredentialsStackSynthesizer()

TypingStack(app, "TypingProStack", env=env_JP, synthesizer=synthesizer)

app.synth()
