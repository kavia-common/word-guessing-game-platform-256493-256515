#!/bin/bash
cd /home/kavia/workspace/code-generation/word-guessing-game-platform-256493-256515/frontend_react_app
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

