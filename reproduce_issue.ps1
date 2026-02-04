$baseUrl = "http://localhost:5131/api"
$email = "mez.jihad@gmail.com"
$password = "admin"

Write-Host "Logging in as $email..."
$loginBody = @{
    email = $email
    password = $password
} | ConvertTo-Json

try {
    $tokenResponse = Invoke-RestMethod -Uri "$baseUrl/Auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $tokenResponse.token
    $headers = @{ Authorization = "Bearer $token" }
} catch {
    Write-Host "Login failed: $($_.Exception.Message)"
    exit
}

Write-Host "Checking/Creating Seller..."
# ... setup seller ...
$sellerId = $null
try {
    $me = Invoke-RestMethod -Uri "$baseUrl/Sellers/me" -Method Get -Headers $headers
    $sellerId = $me.id
    Write-Host "Using existing seller: $sellerId"
} catch {
     Write-Host "No existing seller found."
}

if (-not $sellerId) {
    Write-Host "Creating new seller..."
    $sellerBody = @{
        storeName = "Debug Shop"
        street = "Debug St"
        city = "Debug City"
        zipCode = "00000"
        description = "Debug Description"
        latitude = 0
        longitude = 0
        sourceLanguage = "fr"
    } | ConvertTo-Json
    
    try {
        $seller = Invoke-RestMethod -Uri "$baseUrl/Sellers" -Method Post -Body $sellerBody -ContentType "application/json" -Headers $headers
        $sellerId = $seller.id
        Write-Host "Seller created: $sellerId"
    } catch {
        Write-Host "Create Seller failed: $($_.Exception.Message)"
        exit
    }
}

Write-Host "Deleting Seller $sellerId (Attempt 1)..."
try {
    Invoke-RestMethod -Uri "$baseUrl/Sellers/$sellerId" -Method Delete -Headers $headers
    Write-Host "Seller deleted successfully (1)"
} catch {
    Write-Host "Delete Seller (1) failed: $($_.Exception.Message)"
    if ($_.Exception.Response) {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host "Response: $($reader.ReadToEnd())"
    }
}

Write-Host "Deleting Seller $sellerId (Attempt 2)..."
try {
    Invoke-RestMethod -Uri "$baseUrl/Sellers/$sellerId" -Method Delete -Headers $headers
    Write-Host "Seller deleted successfully (2) - UNEXPECTED"
} catch {
     if ($_.Exception.Response.StatusCode -eq [System.Net.HttpStatusCode]::NotFound) {
        Write-Host "Delete Seller (2) failed as expected with 404 Not Found."
    } else {
        Write-Host "Delete Seller (2) failed with UNEXPECTED error: $($_.Exception.Message)"
        if ($_.Exception.Response) {
                    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            Write-Host "Response: $($reader.ReadToEnd())"
        }
    }
}
