#!/usr/bin/env python3
import aws_cdk as cdk
from typing_stack import TypingStack

app = cdk.App()
TypingStack(app, "TypingProStack")

app.synth()
