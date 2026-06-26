# Authentication System Testing Guide

## Prerequisites
1. Server must be running: `npm run dev`
2. Server should be on http://localhost:3000

## Manual Testing with PowerShell

### Test 1: Health Check
```powershell
Invoke-RestMethod -Uri http://localhost:3000/health -Method GET
```
**Expected**: `{"status":"ok"}`

### Test 2: Register a New User
```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/auth/register -Method POST -ContentType "application/json" -Body '{"email":"test@example.com","password":"password123"}'
```
**Expected**: User created successfully with OTP sent to email

### Test 3: Try to Login (Should Fail - Not Verified)
```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/auth/login -Method POST -ContentType "application/json" -Body '{"email":"test@example.com","password":"password123"}'
```
**Expected**: Error "Veuillez vérifier votre e-mail avant de vous connecter"

### Test 4: Verify OTP (Use the OTP from your email)
```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/auth/verify-otp -Method POST -ContentType "application/json" -Body '{"email":"test@example.com","otp":"123456"}'
```
**Expected**: Email verified successfully

### Test 5: Login (Should Work Now)
```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/auth/login -Method POST -ContentType "application/json" -Body '{"email":"test@example.com","password":"password123"}'
```
**Expected**: Returns JWT token and user data

### Test 6: Access Protected Route (With Token)
```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/users/me -Method GET -Headers @{"Authorization"="Bearer YOUR_TOKEN_HERE"}
```
**Expected**: Returns user profile

### Test 7: Access Protected Route (Without Token)
```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/users/me -Method GET
```
**Expected**: Error "Token d'authentification manquant"

## Automated Testing

Run the automated test suite:
```powershell
node test-endpoints.js
```

This will test all endpoints automatically and show you which tests pass/fail.

## Check Mailtrap for OTP

1. Go to https://mailtrap.io/
2. Login to your account
3. Check the inbox for the OTP code sent during registration
4. Use that OTP in the verify-otp endpoint

## Quick Test Script

Run this one-liner to test the full flow:
```powershell
# Register
$register = Invoke-RestMethod -Uri http://localhost:3000/api/auth/register -Method POST -ContentType "application/json" -Body '{"email":"quicktest@example.com","password":"password123"}'
Write-Host "Registered: $($register.message)"

# Try login (should fail)
try {
    $login = Invoke-RestMethod -Uri http://localhost:3000/api/auth/login -Method POST -ContentType "application/json" -Body '{"email":"quicktest@example.com","password":"password123"}'
} catch {
    Write-Host "Login blocked (expected): $($_.Exception.Response.StatusCode)"
}

Write-Host "`nCheck Mailtrap for OTP code, then verify with:"
Write-Host "Invoke-RestMethod -Uri http://localhost:3000/api/auth/verify-otp -Method POST -ContentType 'application/json' -Body '{\"email\":\"quicktest@example.com\",\"otp\":\"YOUR_OTP\"}'"