FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /src
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -q -DskipTests dependency:go-offline
COPY src ./src
RUN ./mvnw -q -DskipTests package \
    && mv target/*.jar /src/app.jar

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /src/app.jar /app/app.jar
EXPOSE 8286
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
