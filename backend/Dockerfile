# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project file and restore dependencies
COPY ["SuperMarketAPI/SuperMarketAPI.csproj", "SuperMarketAPI/"]
RUN dotnet restore "SuperMarketAPI/SuperMarketAPI.csproj"

# Copy all source code and build
COPY . .
WORKDIR "/src/SuperMarketAPI"
RUN dotnet build "SuperMarketAPI.csproj" -c Release -o /app/build

# Publish the application
RUN dotnet publish "SuperMarketAPI.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 8080

ENTRYPOINT ["dotnet", "SuperMarketAPI.dll"]
