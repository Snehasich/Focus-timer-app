FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY . .

# ✅ FIX permission issue
RUN chmod +x mvnw

# ✅ Build project
RUN ./mvnw clean package -DskipTests

# ✅ Run app
CMD ["sh", "-c", "java -jar target/*.jar"]