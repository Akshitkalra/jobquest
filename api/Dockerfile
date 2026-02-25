# ---- Build stage ----
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY pom.xml mvnw ./
COPY .mvn .mvn
# Download dependencies first (cached layer)
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B
COPY src src
RUN ./mvnw package -DskipTests -B

# ---- Runtime stage ----
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
