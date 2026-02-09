FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["Antigaspi.Api/Antigaspi.Api.csproj", "Antigaspi.Api/"]
COPY ["Antigaspi.Application/Antigaspi.Application.csproj", "Antigaspi.Application/"]
COPY ["Antigaspi.Domain/Antigaspi.Domain.csproj", "Antigaspi.Domain/"]
COPY ["Antigaspi.Infrastructure/Antigaspi.Infrastructure.csproj", "Antigaspi.Infrastructure/"]
RUN dotnet restore "Antigaspi.Api/Antigaspi.Api.csproj"
COPY . .
WORKDIR "/src/Antigaspi.Api"
RUN dotnet build "Antigaspi.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Antigaspi.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "Antigaspi.Api.dll"]
