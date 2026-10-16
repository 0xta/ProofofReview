@echo off
title TasteChain BKK - Server & Tunnel Starter
echo ========================================================
echo   TasteChain BKK - Launching PostgreSQL, Web & Tunnel
echo ========================================================
echo.

echo [1/3] Checking & Starting PostgreSQL Docker Container...
docker start uhack-postgres >nul 2>&1

echo [2/3] Starting Next.js Dev Server (Port 3002)...
start "TasteChain Next.js Server (3002)" cmd /k "npm run dev:3002"

timeout /t 3 /nobreak >nul

echo [3/3] Starting Cloudflare Tunnel...
echo.
echo Look for the public https://*.trycloudflare.com URL below:
echo ========================================================
.\bin\cloudflared.exe tunnel --url http://localhost:3002
