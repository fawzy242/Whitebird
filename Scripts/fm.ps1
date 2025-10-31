param(
    [Parameter(Position = 0)]
    [string]$Command
)

# --- Konfigurasi dasar ---
$solutionDir = (Get-Location).Path
$migrationProject = "$solutionDir\Whitebird.Migrations"
$apiProject = "$solutionDir\Whitebird.Api"
$timestamp = (Get-Date -Format "yyyyMMddHHmmss")
$TargetFramework = "net8.0"
$processor = "SqlServer2016"

# --- Fungsi bantu: baca connection string ---
function Get-ConnectionString {
    $appSettingsPath = "$apiProject\appsettings.json"
    if (-not (Test-Path $appSettingsPath)) {
        throw "❌ appsettings.json tidak ditemukan di $appSettingsPath"
    }
    $json = Get-Content $appSettingsPath | ConvertFrom-Json
    $conn = $json.ConnectionStrings.WhitebirdDb
    if (-not $conn) {
        throw "❌ Tidak ditemukan ConnectionStrings:WhitebirdDb di appsettings.json"
    }
    Write-Host "🔗 Connection string loaded from appsettings.json"
    return $conn
}

# --- Build migration DLL ---
function Build-MigrationDLL {
    Write-Host "🛠️ Building migration project..."
    Remove-Item -Recurse -Force "$migrationProject\bin" -ErrorAction SilentlyContinue
    Remove-Item -Recurse -Force "$migrationProject\obj" -ErrorAction SilentlyContinue

    # Hanya jalankan build
    dotnet build "$migrationProject\Whitebird.Migrations.csproj" -c Debug | Out-Null

    # Path DLL tetap hardcode berdasarkan target framework
    $dllPath = Join-Path $migrationProject "bin\Debug\net8.0\Whitebird.Migrations.dll"
    if (-not (Test-Path $dllPath)) {
        throw "❌ DLL migration tidak ditemukan: $dllPath"
    }
    return $dllPath
}

# --- List migration (status) ---
function Show-Migration {
    Write-Host "📜 Listing available migrations..."
    $dllPath = Build-MigrationDLL
    $conn = Get-ConnectionString

    # Gunakan perintah status terbaru
    dotnet fm migrate:status --assembly "$dllPath" --connection "$conn" --processor "$processor"
}

# --- Menambahkan migration baru ---
function Add-Migration {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Features,

        [Parameter(Mandatory = $true)]
        [string]$Name,

        [Parameter(Mandatory = $false)]
        [string]$Template
    )

    $featureDir = "$migrationProject\Features\$Features"
    if (-not (Test-Path $featureDir)) {
        New-Item -ItemType Directory -Path $featureDir | Out-Null
        Write-Host "📁 Created folder: $featureDir"
    }

    $migrationName = "${timestamp}_${Name}"
    $migrationFile = "$featureDir\$migrationName.cs"

    if ($Template -eq "CRUD") {
        $templateContent = @"
using FluentMigrator;

namespace Whitebird.Migrations.Features.$Features
{
    [Migration($timestamp)]
    public class $Name : Migration
    {
        public override void Up()
        {
            Execute.Sql(@"
                IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='${Features}' AND xtype='U')
                CREATE TABLE [dbo].[${Features}] (
                    [Id] INT IDENTITY(1,1) PRIMARY KEY,
                    [Name] NVARCHAR(255) NOT NULL,
                    [CreatedDate] DATETIME NOT NULL DEFAULT GETDATE()
                );
            ");
        }

        public override void Down()
        {
            Execute.Sql(@"
                IF EXISTS (SELECT * FROM sysobjects WHERE name='${Features}' AND xtype='U')
                DROP TABLE [dbo].[${Features}];
            ");
        }
    }
}
"@
    } else {
        $templateContent = @"
using FluentMigrator;

namespace Whitebird.Migrations.Features.$Features
{
    [Migration($timestamp)]
    public class $Name : Migration
    {
        public override void Up()
        {
            // TODO: add create/alter table logic here
        }

        public override void Down()
        {
            // TODO: add rollback logic here
        }
    }
}
"@
    }

    Set-Content -Path $migrationFile -Value $templateContent -Encoding utf8
    Write-Host "✅ Migration created: $migrationFile"
    if ($Template) { Write-Host "🧩 Template used: $Template" }
}

# --- Deploy migration (migrate:up) ---
function Deploy-Migration {
    Write-Host "🚀 Deploying migrations..."
    $dllPath = Build-MigrationDLL
    $conn = Get-ConnectionString

    # dotnet-fm terbaru hanya butuh --assembly & --connection
    dotnet fm migrate --assembly "$dllPath" --connection "$conn" --processor "$processor"
}

# --- Undo migration (migrate:down) ---
function Undo-Migration {
    param(
        [int]$Step = 1
    )
    Write-Host "↩️ Rolling back $Step step(s)..."
    $dllPath = Build-MigrationDLL
    $conn = Get-ConnectionString

    dotnet fm rollback --assembly "$dllPath" --connection "$conn" --steps $Step --processor "$processor"
}

# --- Routing command ---
switch ($Command) {
    "Show-Migration" { Show-Migration }
    "Add-Migration" { Add-Migration @args }
    "Deploy-Migration" { Deploy-Migration }
    "Undo-Migration" { Undo-Migration @args }
    default {
        Write-Host "🧩 FluentMigrator Helper Script"
        Write-Host "---------------------------------"
        Write-Host "Usage:"
        Write-Host "  Show-Migration"
        Write-Host "  Add-Migration -Features <FeatureName> -Name <MigrationName> [-Template CRUD]"
        Write-Host "  Deploy-Migration"
        Write-Host "  Undo-Migration [-Step <n>]"
    }
}
