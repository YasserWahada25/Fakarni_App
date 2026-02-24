# Étape 1 : Construction (Build)
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src

# Ajout du cache Maven et de la tolérance aux coupures réseau
RUN --mount=type=cache,target=/root/.m2 mvn clean package -DskipTests -Dfile.encoding=UTF-8 -Dmaven.wagon.http.retryHandler.count=5 -Dhttp.keepAlive=false

# Étape 2 : Exécution
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]