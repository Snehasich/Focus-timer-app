# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-17 AS build

WORKDIR /app

# Copy repository content
COPY . /app

# Detect pom.xml location and build the jar
RUN if [ -f "pom.xml" ]; then \
      mvn clean package -DskipTests && cp target/*.jar /app/app.jar; \
    elif [ -f "server/pom.xml" ]; then \
      cd server && mvn clean package -DskipTests && cp target/*.jar /app/app.jar; \
    else \
      echo "Error: pom.xml not found!" && exit 1; \
    fi

# Stage 2: Run
FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY --from=build /app/app.jar app.jar

EXPOSE 8080

CMD ["java", "-jar", "app.jar"]