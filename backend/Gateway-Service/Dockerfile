# Étape 1 : Construction (Build)
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src

# CORRECTION ICI : Ajout de l'encodage ISO-8859-1 pour éviter le crash lié aux accents dans application.properties
RUN mvn clean package -DskipTests -Dproject.build.sourceEncoding=ISO-8859-1

# Étape 2 : Exécution
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# CORRECTION ICI : On expose le port 9012 pour le Geofencing (et non 8090)
EXPOSE 9012
ENTRYPOINT ["java", "-jar", "app.jar"]