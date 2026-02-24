# Étape 1 : Construction (Build) avec Java 21
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
# On ajoute le montage du cache Maven pour sauvegarder la progression du téléchargement !
RUN --mount=type=cache,target=/root/.m2 mvn clean package -DskipTests -Dfile.encoding=UTF-8 -Dmaven.wagon.http.retryHandler.count=5 -Dhttp.keepAlive=false
# Étape 2 : Lancement (Run) avec Java 21
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]