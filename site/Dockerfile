# ---- Build Stage ----
FROM maven:3.9.7-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests

# ---- Run Stage ----
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
# Use PORT env var if set, else default to 8080
ENV PORT=8080
ENTRYPOINT ["java", "-jar", "app.jar"] 