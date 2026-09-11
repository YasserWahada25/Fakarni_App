# ============================================================
# FakarniApp - Script de deploiement complet sur Azure App Service
# Prerequis :
#   1. az login (compte ESPRIT)
#   2. App Service Plan "fakarni-plan" deja cree dans swedencentral
#   3. Eureka et User deja deployes
# Usage : .\deploy-all-services.ps1
# ============================================================

$ErrorActionPreference = "Continue"
$RG = "rg-fakarni-prod"
$PLAN = "fakarni-plan"
$DOCKER_USER = "yasserwahada25"

# URL Eureka Azure (utilisee par tous les services pour la decouverte)
$EUREKA_URL = "http://fakarni-eureka.azurewebsites.net/eureka/"

# JWT Secret (a personnaliser)
$JWT_SECRET = "ZHVtbXktc2VjcmV0LXNlY3JldC1zZWNyZXQtc2VjcmV0LXNlY3JldC1zZWNyZXQ="

# MongoDB Atlas URI (deja configure)
$MONGO_URI = "mongodb+srv://wahadayasser25_db_user:VOTRE_MOT_DE_PASSE@cluster0.xxxxx.mongodb.net/"

# Mailtrap (Event-Service)
$MAILTRAP_USER = "VOTRE_MAILTRAP_USER"
$MAILTRAP_PASS = "VOTRE_MAILTRAP_PASS"

# Gmail (User-Service + Geofencing)
$GMAIL_USER = "wahadayasser25@gmail.com"
$GMAIL_PASS = "VOTRE_APP_PASSWORD_GMAIL"

# Twilio (Tracking + Geofencing)
# Trouver sur : console.twilio.com -> Account -> Account Info
$TWILIO_SID   = "VOTRE_TWILIO_ACCOUNT_SID"
$TWILIO_TOKEN = "VOTRE_TWILIO_AUTH_TOKEN"
$TWILIO_FROM  = "+15103302711"

function Write-Step { param([string]$msg)
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "  $msg" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
}
function Write-OK   { param([string]$msg) Write-Host "  [OK]   $msg" -ForegroundColor Green }
function Write-Warn { param([string]$msg) Write-Host "  [WARN] $msg" -ForegroundColor Red }

# Variables communes a tous les services Spring Boot
$COMMON_VARS = @(
    "SPRING_PROFILES_ACTIVE=prod"
    "EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=$EUREKA_URL"
    "EUREKA_INSTANCE_HOSTNAME=`${WEBSITE_HOSTNAME}"
    "EUREKA_INSTANCE_PREFER_IP_ADDRESS=false"
    "EUREKA_INSTANCE_NONSECUREPORT=80"
    "SECURITY_JWT_SECRET=$JWT_SECRET"
)

# ============================================================
# SERVICES A DEPLOYER (ordre : Dossier+Flask avant Detection)
# ============================================================
$SERVICES = @(
    @{
        name = "fakarni-dossier"
        image = "fakarni-dossier-medical-service"
        port = 8059
        vars = $COMMON_VARS + @(
            "WEBSITES_PORT=8059"
            "SERVER_PORT=8059"
            "SPRING_DATASOURCE_URL=jdbc:mysql://VOTRE_MYSQL_HOST:3306/dossier_medical_db?useSSL=true"
            "SPRING_DATASOURCE_USERNAME=VOTRE_USER_MYSQL"
            "SPRING_DATASOURCE_PASSWORD=VOTRE_PASS_MYSQL"
        )
    }
    @{
        name = "fakarni-flask-ia"
        image = "fakarni-flask-ia-service"
        port = 5000
        vars = @(
            "WEBSITES_PORT=5000"
            "FLASK_ENV=production"
        )
    }
    @{
        name = "fakarni-detection"
        image = "fakarni-detection-maladie-service"
        port = 8058
        vars = $COMMON_VARS + @(
            "WEBSITES_PORT=8058"
            "SERVER_PORT=8058"
            "IA_FLASK_URL=https://fakarni-flask-ia.azurewebsites.net"
            "SPRING_DATASOURCE_URL=jdbc:mysql://VOTRE_MYSQL_HOST:3306/detection_maladie_db?useSSL=true"
            "SPRING_DATASOURCE_USERNAME=VOTRE_USER_MYSQL"
            "SPRING_DATASOURCE_PASSWORD=VOTRE_PASS_MYSQL"
        )
    }
    @{
        name = "fakarni-chat"
        image = "fakarni-chat-service"
        port = 8070
        vars = $COMMON_VARS + @(
            "WEBSITES_PORT=8070"
            "SERVER_PORT=8070"
            "SPRING_DATA_MONGODB_URI=$MONGO_URI"
            "SPRING_DATA_MONGODB_DATABASE=chat_db"
        )
    }
    @{
        name = "fakarni-meeting"
        image = "fakarni-meeting-insights-service"
        port = 8096
        vars = $COMMON_VARS + @(
            "WEBSITES_PORT=8096"
            "SERVER_PORT=8096"
            "SPRING_DATA_MONGODB_URI=$MONGO_URI"
        )
    }
    @{
        name = "fakarni-tracking"
        image = "fakarni-tracking-service"
        port = 9011
        vars = $COMMON_VARS + @(
            "WEBSITES_PORT=9011"
            "SERVER_PORT=9011"
            "SPRING_DATASOURCE_URL=jdbc:mysql://VOTRE_MYSQL_HOST:3306/db_tracking?useSSL=true"
            "SPRING_DATASOURCE_USERNAME=VOTRE_USER_MYSQL"
            "SPRING_DATASOURCE_PASSWORD=VOTRE_PASS_MYSQL"
            "TWILIO_ACCOUNT_SID=$TWILIO_SID"
            "TWILIO_AUTH_TOKEN=$TWILIO_TOKEN"
            "TWILIO_FROM=$TWILIO_FROM"
        )
    }
    @{
        name = "fakarni-geofencing"
        image = "fakarni-geofencing-service"
        port = 9012
        vars = $COMMON_VARS + @(
            "WEBSITES_PORT=9012"
            "SERVER_PORT=9012"
            "SPRING_DATASOURCE_URL=jdbc:mysql://VOTRE_MYSQL_HOST:3306/db_geofencing?useSSL=true"
            "SPRING_DATASOURCE_USERNAME=VOTRE_USER_MYSQL"
            "SPRING_DATASOURCE_PASSWORD=VOTRE_PASS_MYSQL"
            "TWILIO_ACCOUNT_SID=$TWILIO_SID"
            "TWILIO_AUTH_TOKEN=$TWILIO_TOKEN"
            "TWILIO_FROM=$TWILIO_FROM"
            "SPRING_MAIL_USERNAME=$GMAIL_USER"
            "SPRING_MAIL_PASSWORD=$GMAIL_PASS"
        )
    }
    @{
        name = "fakarni-activite"
        image = "fakarni-activite-educative-service"
        port = 8084
        vars = $COMMON_VARS + @(
            "WEBSITES_PORT=8084"
            "SERVER_PORT=8084"
            "SPRING_DATASOURCE_URL=jdbc:mysql://VOTRE_MYSQL_HOST:3306/activite_educative_db?useSSL=true"
            "SPRING_DATASOURCE_USERNAME=VOTRE_USER_MYSQL"
            "SPRING_DATASOURCE_PASSWORD=VOTRE_PASS_MYSQL"
        )
    }
    @{
        name = "fakarni-event"
        image = "fakarni-event-service"
        port = 8087
        vars = $COMMON_VARS + @(
            "WEBSITES_PORT=8087"
            "SERVER_PORT=8087"
            "SPRING_DATASOURCE_URL=jdbc:mysql://VOTRE_MYSQL_HOST:3306/EventFakerni?useSSL=true"
            "SPRING_DATASOURCE_USERNAME=VOTRE_USER_MYSQL"
            "SPRING_DATASOURCE_PASSWORD=VOTRE_PASS_MYSQL"
            "SPRING_MAIL_HOST=sandbox.smtp.mailtrap.io"
            "SPRING_MAIL_USERNAME=$MAILTRAP_USER"
            "SPRING_MAIL_PASSWORD=$MAILTRAP_PASS"
        )
    }
    @{
        name = "fakarni-group"
        image = "fakarni-group-service"
        port = 8097
        vars = $COMMON_VARS + @(
            "WEBSITES_PORT=8097"
            "SERVER_PORT=8097"
            "SPRING_DATASOURCE_URL=jdbc:mysql://VOTRE_MYSQL_HOST:3306/group_service_db?useSSL=true"
            "SPRING_DATASOURCE_USERNAME=VOTRE_USER_MYSQL"
            "SPRING_DATASOURCE_PASSWORD=VOTRE_PASS_MYSQL"
        )
    }
    @{
        name = "fakarni-post"
        image = "fakarni-post-service"
        port = 8069
        vars = $COMMON_VARS + @(
            "WEBSITES_PORT=8069"
            "SERVER_PORT=8069"
            "SPRING_DATASOURCE_URL=jdbc:mysql://VOTRE_MYSQL_HOST:3306/post_service_db?useSSL=true"
            "SPRING_DATASOURCE_USERNAME=VOTRE_USER_MYSQL"
            "SPRING_DATASOURCE_PASSWORD=VOTRE_PASS_MYSQL"
        )
    }
    @{
        name = "fakarni-session"
        image = "fakarni-session-service"
        port = 8085
        vars = $COMMON_VARS + @(
            "WEBSITES_PORT=8085"
            "SERVER_PORT=8085"
            "SPRING_DATASOURCE_URL=jdbc:mysql://VOTRE_MYSQL_HOST:3306/alzheimer_session_db?useSSL=true"
            "SPRING_DATASOURCE_USERNAME=VOTRE_USER_MYSQL"
            "SPRING_DATASOURCE_PASSWORD=VOTRE_PASS_MYSQL"
        )
    }
    @{
        name = "fakarni-suivi"
        image = "fakarni-suivi-engagement-service"
        port = 8088
        vars = $COMMON_VARS + @(
            "WEBSITES_PORT=8088"
            "SERVER_PORT=8088"
            "SPRING_DATASOURCE_URL=jdbc:mysql://VOTRE_MYSQL_HOST:3306/suivi_engagement_db?useSSL=true"
            "SPRING_DATASOURCE_USERNAME=VOTRE_USER_MYSQL"
            "SPRING_DATASOURCE_PASSWORD=VOTRE_PASS_MYSQL"
        )
    }
    @{
        name = "fakarni-gateway"
        image = "fakarni-gateway-service"
        port = 8090
        vars = $COMMON_VARS + @(
            "WEBSITES_PORT=8090"
            "SERVER_PORT=8090"
            "SPRING_CLOUD_GATEWAY_DISCOVERY_LOCATOR_ENABLED=true"
            "SPRING_CLOUD_GATEWAY_DISCOVERY_LOCATOR_LOWER_CASE_SERVICE_ID=true"
        )
    }
)

# ============================================================
# DEPLOIEMENT
# ============================================================
Write-Step "Deploiement de $($SERVICES.Count) services sur Azure App Service"

foreach ($svc in $SERVICES) {
    Write-Step "Deploiement : $($svc.name)"

    # Verifier si la webapp existe deja
    $exists = az webapp show --name $svc.name --resource-group $RG --query "name" --output tsv 2>$null

    if (-not $exists) {
        Write-Host "  Creation de la webapp $($svc.name)..." -ForegroundColor Yellow
        az webapp create `
            --resource-group $RG `
            --plan $PLAN `
            --name $svc.name `
            --deployment-container-image-name "$DOCKER_USER/$($svc.image):latest" `
            --output none 2>&1 | Out-Null
        Write-OK "Webapp $($svc.name) creee"
    } else {
        Write-OK "Webapp $($svc.name) existe deja - mise a jour de l'image"
        az webapp config container set `
            --name $svc.name `
            --resource-group $RG `
            --docker-custom-image-name "$DOCKER_USER/$($svc.image):latest" `
            --output none 2>&1 | Out-Null
    }

    # Configurer les variables d'environnement
    Write-Host "  Configuration des variables..." -ForegroundColor Yellow
    az webapp config appsettings set `
        --resource-group $RG `
        --name $svc.name `
        --settings $svc.vars `
        --output none 2>&1 | Out-Null
    Write-OK "Variables configurees pour $($svc.name)"
}

# ============================================================
# RAPPORT FINAL
# ============================================================
Write-Step "URLs de tous les services deployes"

$allServices = @("fakarni-eureka", "fakarni-user") + ($SERVICES | ForEach-Object { $_.name })
foreach ($name in $allServices) {
    $url = az webapp show --name $name --resource-group $RG --query "defaultHostName" --output tsv 2>$null
    if ($url) {
        Write-Host "  https://$url" -ForegroundColor Green -NoNewline
        Write-Host " ($name)" -ForegroundColor Gray
    }
}

Write-Host "`n>>> PROCHAINE ETAPE : Configurer MySQL Azure Flexible Server" -ForegroundColor Cyan
Write-Host "    Remplacer VOTRE_MYSQL_HOST par l'URL de votre serveur MySQL" -ForegroundColor Yellow
Write-Host ">>> Eureka Dashboard : https://fakarni-eureka.azurewebsites.net" -ForegroundColor Cyan
