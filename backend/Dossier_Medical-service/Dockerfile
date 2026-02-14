FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
# Commande sécurisée contre les erreurs d'encodage Windows
# On ajoute des options pour réessayer 3 fois si le téléchargement échoue
RUN mvn clean package -DskipTests -Dfile.encoding=UTF-8 -Dmaven.wagon.http.retryHandler.count=3 -Dhttp.keepAlive=false
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]