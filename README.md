# app:typingpropy

#　アーキテクチャー


#　核技術選定理由
# 大まかに永続無料を目標に選定

-　vercel→S3+cloudfrontは１２か月無料でも永続無料×
-　apigateway,rds→超過するとコスト高
-　cdk→SAMはTS,pythonで書けない/書かない場合毎回変更したらコンソール上で修正しなければいけない


