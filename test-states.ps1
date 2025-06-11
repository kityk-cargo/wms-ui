# Test Provider State Management

Write-Host "Testing Provider State Management..." -ForegroundColor Yellow

# Test 1: Set state to "orders exist"
Write-Host "`n1. Setting state to 'orders exist':" -ForegroundColor Green
$body1 = '{"state": "orders exist"}'
try {
    $response1 = Invoke-RestMethod -Uri "http://localhost:30090/api/mock-server/state" -Method POST -Body $body1 -ContentType "application/json"
    Write-Host "Success: $($response1.message)" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Get orders with current state
Write-Host "`n2. Getting orders with 'orders exist' state:" -ForegroundColor Green
try {
    $ordersResponse = Invoke-RestMethod -Uri "http://localhost:30090/api/v1/orders" -Method GET
    Write-Host "Status Code: 200, Orders returned: $($ordersResponse.Count)" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Set state to "server is experiencing issues"
Write-Host "`n3. Setting state to 'server is experiencing issues':" -ForegroundColor Green
$body2 = '{"state": "server is experiencing issues"}'
try {
    $response2 = Invoke-RestMethod -Uri "http://localhost:30090/api/mock-server/state" -Method POST -Body $body2 -ContentType "application/json"
    Write-Host "Success: $($response2.message)" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Get orders with error state (should return 500)
Write-Host "`n4. Getting orders with 'server is experiencing issues' state:" -ForegroundColor Green
try {
    $errorResponse = Invoke-RestMethod -Uri "http://localhost:30090/api/v1/orders" -Method GET
    Write-Host "Unexpected success - should have failed" -ForegroundColor Yellow
} catch {
    if ($_.Exception.Response.StatusCode -eq 500) {
        Write-Host "Expected 500 error received" -ForegroundColor Green
    } else {
        Write-Host "Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 5: Reset states
Write-Host "`n5. Resetting provider states:" -ForegroundColor Green
try {
    $resetResponse = Invoke-RestMethod -Uri "http://localhost:30090/api/mock-server/reset" -Method POST
    Write-Host "Success: $($resetResponse.message)" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Try invalid state
Write-Host "`n6. Testing invalid state:" -ForegroundColor Green
$invalidBody = '{"state": "nonexistent state"}'
try {
    $invalidResponse = Invoke-RestMethod -Uri "http://localhost:30090/api/mock-server/state" -Method POST -Body $invalidBody -ContentType "application/json"
    Write-Host "Unexpected success: $($invalidResponse.message)" -ForegroundColor Yellow
} catch {
    Write-Host "Expected error for invalid state" -ForegroundColor Green
}

Write-Host "`nTesting completed!" -ForegroundColor Yellow 