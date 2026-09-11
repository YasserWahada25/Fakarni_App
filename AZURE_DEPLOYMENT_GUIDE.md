# Guide de déploiement Azure — FakarniApp

Ce document couvre toutes les étapes pour créer l'infrastructure Azure,
configurer GitHub Actions, et déployer les 17 composants backend sur AKS.

---

## Prérequis

- [Azure CLI](https://learn.microsoft.com/fr-fr/cli/azure/install-azure-cli) installé et connecté (`az login`)
- [kubectl](https://kubernetes.io/docs/tasks/tools/) installé
- [Helm](https://helm.sh/docs/intro/install/) installé
- Accès Owner ou Contributor sur l'abonnement Azure
- Repository GitHub avec les secrets configurés (voir section 5)

---

## 1. Créer le groupe de ressources et les variables de base

```bash
# Variables — adapter selon votre organisation
RESOURCE_GROUP="rg-fakarni-prod"
LOCATION="francecentral"
ACR_NAME="fakarnicr"                          # doit être unique globalement
AKS_NAME="fakarni-aks"
KEYVAULT_NAME="fakarni-keyvault"
MYSQL_SERVER="fakarni-mysql"
COSMOS_ACCOUNT="fakarni-cosmos"

# Créer le groupe de ressources
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION
```

---

## 2. Azure Container Registry (ACR)

Remplace DockerHub — stocke toutes les images Docker en privé.

```bash
# Créer l'ACR
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME \
  --sku Basic \
  --admin-enabled false

# Vérifier
az acr show --name $ACR_NAME --query loginServer --output tsv
# → fakarnicr.azurecr.io
```

---

## 3. Azure Kubernetes Service (AKS)

```bash
# Créer le cluster AKS (2 nœuds pour commencer, scalable)
az aks create \
  --resource-group $RESOURCE_GROUP \
  --name $AKS_NAME \
  --node-count 2 \
  --node-vm-size Standard_D2s_v3 \
  --enable-managed-identity \
  --attach-acr $ACR_NAME \
  --enable-oidc-issuer \
  --enable-workload-identity \
  --generate-ssh-keys

# Récupérer les credentials kubectl
az aks get-credentials \
  --resource-group $RESOURCE_GROUP \
  --name $AKS_NAME \
  --overwrite-existing

# Vérifier la connexion
kubectl get nodes
```

> `--attach-acr` accorde automatiquement à AKS le droit de puller les images depuis ACR.
> `--enable-oidc-issuer` + `--enable-workload-identity` permettent à External Secrets Operator
> d'accéder à Key Vault sans stocker de credentials dans le cluster.

---

## 4. Azure Key Vault

Stocke tous les secrets (JWT, mots de passe BDD, Twilio, OAuth2...).

```bash
# Créer le Key Vault
az keyvault create \
  --resource-group $RESOURCE_GROUP \
  --name $KEYVAULT_NAME \
  --location $LOCATION \
  --enable-rbac-authorization true

# Récupérer l'Object ID de la Managed Identity AKS
AKS_IDENTITY=$(az aks show \
  --resource-group $RESOURCE_GROUP \
  --name $AKS_NAME \
  --query identityProfile.kubeletidentity.objectId \
  --output tsv)

# Donner accès en lecture au cluster AKS
az role assignment create \
  --role "Key Vault Secrets User" \
  --assignee $AKS_IDENTITY \
  --scope $(az keyvault show --name $KEYVAULT_NAME --query id --output tsv)
```

### 4.1 Peupler les secrets dans Key Vault

```bash
# JWT
az keyvault secret set --vault-name $KEYVAULT_NAME \
  --name "jwt-secret" \
  --value "VOTRE_JWT_SECRET_BASE64_FORT"

# Mail User-Service (Gmail)
az keyvault secret set --vault-name $KEYVAULT_NAME \
  --name "mail-username-user" --value "votre-email@gmail.com"
az keyvault secret set --vault-name $KEYVAULT_NAME \
  --name "mail-password-user" --value "votre-app-password-gmail"

# Mail Geofencing-Service (Gmail)
az keyvault secret set --vault-name $KEYVAULT_NAME \
  --name "mail-username-geofencing" --value "votre-email@gmail.com"
az keyvault secret set --vault-name $KEYVAULT_NAME \
  --name "mail-password-geofencing" --value "votre-app-password-gmail"

# Mailtrap (Event-Service)
az keyvault secret set --vault-name $KEYVAULT_NAME \
  --name "mailtrap-username" --value "VOTRE_MAILTRAP_USERNAME"
az keyvault secret set --vault-name $KEYVAULT_NAME \
  --name "mailtrap-password" --value "VOTRE_MAILTRAP_PASSWORD"

# Google OAuth2
az keyvault secret set --vault-name $KEYVAULT_NAME \
  --name "google-client-id" --value "VOTRE_GOOGLE_CLIENT_ID"

# Facebook OAuth2
az keyvault secret set --vault-name $KEYVAULT_NAME \
  --name "facebook-app-id" --value "VOTRE_FACEBOOK_APP_ID"
az keyvault secret set --vault-name $KEYVAULT_NAME \
  --name "facebook-app-secret" --value "VOTRE_FACEBOOK_APP_SECRET"

# Twilio
az keyvault secret set --vault-name $KEYVAULT_NAME \
  --name "twilio-account-sid" --value "VOTRE_TWILIO_SID"
az keyvault secret set --vault-name $KEYVAULT_NAME \
  --name "twilio-auth-token" --value "VOTRE_TWILIO_TOKEN"
az keyvault secret set --vault-name $KEYVAULT_NAME \
  --name "twilio-from-number" --value "+1XXXXXXXXXX"

# MongoDB URI (Azure Cosmos DB — voir section 6)
az keyvault secret set --vault-name $KEYVAULT_NAME \
  --name "mongodb-uri" \
  --value "mongodb://fakarni-cosmos:MOT_DE_PASSE@fakarni-cosmos.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb"

# MySQL password (Azure Database for MySQL — voir section 7)
az keyvault secret set --vault-name $KEYVAULT_NAME \
  --name "mysql-password" --value "VOTRE_MYSQL_PASSWORD_FORT"
```

---

## 5. Azure Database for MySQL Flexible Server

Un seul serveur partagé avec 10 bases de données séparées.
Remplace les 10 containers MySQL du docker-compose.

```bash
az mysql flexible-server create \
  --resource-group $RESOURCE_GROUP \
  --name $MYSQL_SERVER \
  --location $LOCATION \
  --admin-user fakarni_admin \
  --admin-password "VOTRE_MYSQL_PASSWORD_FORT" \
  --sku-name Standard_B2ms \
  --tier Burstable \
  --storage-size 32 \
  --version 8.0

# Autoriser les connexions depuis AKS (via IP publique du VNet ou Private Endpoint)
# Option simple pour démarrer — à remplacer par Private Endpoint en production
az mysql flexible-server firewall-rule create \
  --resource-group $RESOURCE_GROUP \
  --name $MYSQL_SERVER \
  --rule-name allow-aks \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Créer les 10 bases de données
for DB in db_tracking db_geofencing activite_educative_db detection_maladie_db \
          dossier_medical_db EventFakerni group_service_db post_service_db \
          alzheimer_session_db suivi_engagement_db; do
  az mysql flexible-server db create \
    --resource-group $RESOURCE_GROUP \
    --server-name $MYSQL_SERVER \
    --database-name $DB
  echo "✅ Base créée : $DB"
done
```

---

## 6. Azure Cosmos DB (API MongoDB)

Remplace le container MongoDB du docker-compose.

```bash
az cosmosdb create \
  --resource-group $RESOURCE_GROUP \
  --name $COSMOS_ACCOUNT \
  --kind MongoDB \
  --server-version 4.2 \
  --locations regionName=$LOCATION failoverPriority=0 isZoneRedundant=false

# Créer les 3 bases
for DB in rayen chat_db meeting-insights; do
  az cosmosdb mongodb database create \
    --resource-group $RESOURCE_GROUP \
    --account-name $COSMOS_ACCOUNT \
    --name $DB
  echo "✅ Base MongoDB créée : $DB"
done

# Récupérer la connection string pour Key Vault
az cosmosdb keys list \
  --resource-group $RESOURCE_GROUP \
  --name $COSMOS_ACCOUNT \
  --type connection-strings \
  --query "connectionStrings[0].connectionString" \
  --output tsv
# → Copier cette valeur dans le secret Key Vault "mongodb-uri"
```

---

## 7. Configurer GitHub Actions — Service Principal OIDC

GitHub Actions se connecte à Azure via OIDC (sans secret permanent — plus sécurisé que les credentials classiques).

```bash
# Récupérer les IDs nécessaires
SUBSCRIPTION_ID=$(az account show --query id --output tsv)
TENANT_ID=$(az account show --query tenantId --output tsv)

# Créer le Service Principal pour GitHub Actions
APP_ID=$(az ad app create \
  --display-name "fakarni-github-actions" \
  --query appId --output tsv)

SP_ID=$(az ad sp create \
  --id $APP_ID \
  --query id --output tsv)

# Donner les droits nécessaires
az role assignment create \
  --role "AcrPush" \
  --assignee $SP_ID \
  --scope $(az acr show --name $ACR_NAME --query id --output tsv)

az role assignment create \
  --role "Azure Kubernetes Service Cluster User Role" \
  --assignee $SP_ID \
  --scope $(az aks show --resource-group $RESOURCE_GROUP --name $AKS_NAME --query id --output tsv)

# Configurer la fédération OIDC pour GitHub Actions
# Remplacer VOTRE_ORG et VOTRE_REPO par vos valeurs réelles
az ad app federated-credential create \
  --id $APP_ID \
  --parameters '{
    "name": "fakarni-github-main",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:VOTRE_ORG/Esprit_PI_4SAE5_2026_FakarniApp:ref:refs/heads/main",
    "audiences": ["api://AzureADTokenExchange"]
  }'

az ad app federated-credential create \
  --id $APP_ID \
  --parameters '{
    "name": "fakarni-github-pr",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:VOTRE_ORG/Esprit_PI_4SAE5_2026_FakarniApp:pull_request",
    "audiences": ["api://AzureADTokenExchange"]
  }'

# Afficher les valeurs à copier dans GitHub Secrets
echo "=== Valeurs pour GitHub Secrets ==="
echo "AZURE_CLIENT_ID      : $APP_ID"
echo "AZURE_TENANT_ID      : $TENANT_ID"
echo "AZURE_SUBSCRIPTION_ID: $SUBSCRIPTION_ID"
echo "ACR_LOGIN_SERVER     : ${ACR_NAME}.azurecr.io"
echo "AKS_RESOURCE_GROUP   : $RESOURCE_GROUP"
echo "AKS_CLUSTER_NAME     : $AKS_NAME"
```

### 7.1 Ajouter les secrets dans GitHub

Dans votre repository GitHub :
`Settings → Secrets and variables → Actions → New repository secret`

| Nom du secret | Valeur |
|---|---|
| `AZURE_CLIENT_ID` | App ID du Service Principal |
| `AZURE_TENANT_ID` | Tenant ID Azure |
| `AZURE_SUBSCRIPTION_ID` | Subscription ID Azure |
| `ACR_LOGIN_SERVER` | `fakarnicr.azurecr.io` |
| `AKS_RESOURCE_GROUP` | `rg-fakarni-prod` |
| `AKS_CLUSTER_NAME` | `fakarni-aks` |
| `SONAR_TOKEN` | Token SonarCloud (depuis sonarcloud.io) |

> Tous les secrets métier (JWT, mots de passe, clés API) sont dans Azure Key Vault —
> ils ne transitent **jamais** par GitHub Secrets.

---

## 8. Installer External Secrets Operator sur AKS

Synchronise automatiquement les secrets depuis Azure Key Vault vers Kubernetes.

```bash
# Ajouter le repo Helm
helm repo add external-secrets https://charts.external-secrets.io
helm repo update

# Installer l'opérateur
helm install external-secrets \
  external-secrets/external-secrets \
  --namespace external-secrets \
  --create-namespace \
  --set installCRDs=true

# Vérifier
kubectl get pods -n external-secrets
```

---

## 9. Créer les environnements GitHub (staging / production)

Dans GitHub : `Settings → Environments`

**staging**
- Aucune protection — déploiement automatique sur push `develop`

**production**
- Activer "Required reviewers" → ajouter votre équipe
- Déploiement automatique uniquement après approbation sur push `main`

---

## 10. Déploiement initial sur AKS — ordre à respecter

Appliquer dans cet ordre strict (dépendances entre services) :

```bash
# 1. Namespaces
kubectl apply -f k8s/namespace.yaml

# 2. ConfigMaps
kubectl apply -f k8s/configmaps/fakarni-common-config.yaml -n fakarni-prod

# 3. External Secrets (synchronise les secrets depuis Key Vault)
kubectl apply -f k8s/secrets/external-secrets.yaml
# Attendre que les secrets soient synchronisés (~30s)
kubectl get externalsecret -n fakarni-prod
# Vérifier que STATUS = Ready

# 4. Eureka (service discovery — doit être UP avant tous les autres)
kubectl apply -f k8s/deployments/eureka-service-deployment.yaml -n fakarni-prod
kubectl apply -f k8s/services/eureka-service-service.yaml -n fakarni-prod
kubectl rollout status deployment/eureka-service -n fakarni-prod

# 5. Flask IA (prérequis pour Detection-Maladie — prend ~60s au démarrage)
kubectl apply -f k8s/deployments/flask-ia-service-deployment.yaml -n fakarni-prod
kubectl apply -f k8s/services/flask-ia-service-service.yaml -n fakarni-prod

# 6. Services sans dépendances critiques (en parallèle)
for SVC in user-service chat-service meeting-insights-service \
           dossier-medical-service activite-educative-service \
           tracking-service geofencing-service session-service \
           group-service post-service event-service; do
  kubectl apply -f k8s/deployments/${SVC}-deployment.yaml -n fakarni-prod
  kubectl apply -f k8s/services/${SVC}-service.yaml -n fakarni-prod
done

# 7. Services avec dépendances Feign (après que les cibles soient UP)
kubectl apply -f k8s/deployments/detection-maladie-service-deployment.yaml -n fakarni-prod
kubectl apply -f k8s/services/detection-maladie-service-service.yaml -n fakarni-prod
kubectl apply -f k8s/deployments/suivi-engagement-service-deployment.yaml -n fakarni-prod
kubectl apply -f k8s/services/suivi-engagement-service-service.yaml -n fakarni-prod

# 8. Gateway — en dernier (expose tout)
kubectl apply -f k8s/deployments/gateway-service-deployment.yaml -n fakarni-prod
kubectl apply -f k8s/services/gateway-service-service.yaml -n fakarni-prod
kubectl rollout status deployment/gateway-service -n fakarni-prod

# 9. Ingress
kubectl apply -f k8s/ingress/fakarni-ingress.yaml -n fakarni-prod

# 10. HPA
kubectl apply -f k8s/hpa/fakarni-hpa.yaml -n fakarni-prod

# Vérification finale
kubectl get pods -n fakarni-prod
kubectl get services -n fakarni-prod
kubectl get ingress -n fakarni-prod

# Récupérer l'IP publique de la Gateway
kubectl get service gateway-service -n fakarni-prod \
  --output jsonpath='{.status.loadBalancer.ingress[0].ip}'
```

---

## 11. SonarCloud (remplace SonarQube local)

1. Créer un compte sur [sonarcloud.io](https://sonarcloud.io) avec votre compte GitHub
2. Créer une organisation : `fakarniapp`
3. Importer le repository
4. Générer un token : `My Account → Security → Generate Token`
5. Ajouter ce token dans GitHub Secrets sous le nom `SONAR_TOKEN`
6. Dans SonarCloud, créer 16 projets avec les clés correspondant aux `sonar-project-key` des workflows

---

## 12. Vérification post-déploiement

```bash
# Tester l'API Gateway via l'IP publique
GATEWAY_IP=$(kubectl get service gateway-service -n fakarni-prod \
  --output jsonpath='{.status.loadBalancer.ingress[0].ip}')

# Health check de chaque service via la Gateway
curl http://$GATEWAY_IP:8090/actuator/health

# Tester l'authentification
curl -X POST http://$GATEWAY_IP:8090/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'

# Vérifier que tous les services sont enregistrés dans Eureka
curl http://$GATEWAY_IP:8090/eureka/apps | grep -o '<app>.*</app>'

# Logs d'un service spécifique
kubectl logs -n fakarni-prod -l app=user-service --tail=50

# Métriques HPA
kubectl get hpa -n fakarni-prod
```

---

## Résumé des ressources Azure créées

| Ressource | Nom | Usage |
|---|---|---|
| Resource Group | `rg-fakarni-prod` | Container de toutes les ressources |
| Container Registry | `fakarnicr.azurecr.io` | Images Docker des 17 services |
| Kubernetes Service | `fakarni-aks` | Cluster hébergeant les pods |
| Key Vault | `fakarni-keyvault` | Tous les secrets (JWT, BDD, OAuth2, Twilio) |
| MySQL Flexible Server | `fakarni-mysql` | 10 bases de données relationnelles |
| Cosmos DB (MongoDB) | `fakarni-cosmos` | 3 bases documentaires (users, chat, meetings) |
| Service Principal | `fakarni-github-actions` | Authentification OIDC depuis GitHub Actions |
