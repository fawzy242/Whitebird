using FluentMigrator;

namespace Whitebird.Migrations.Features.Users
{
    [Migration(20251031210631)]
    public class CreateTable : Migration
    {
        public override void Up()
        {
            Execute.Sql(@"IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Users' AND xtype = 'U')
BEGIN
    CREATE TABLE [dbo].[Users]
    (
        [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [Username] NVARCHAR(50) NOT NULL UNIQUE,
        [Email] NVARCHAR(100) NOT NULL UNIQUE,
        [PasswordHash] NVARCHAR(255) NOT NULL,
        [CreatedAt] DATETIME NOT NULL DEFAULT(GETDATE()),
        [UpdatedAt] DATETIME NULL
    );
END
");
        }

        public override void Down()
        {
            Execute.Sql(@"IF EXISTS (SELECT * FROM sysobjects WHERE name = 'Users' AND xtype = 'U')
BEGIN
    DROP TABLE [dbo].[Users];
END
");
        }
    }
}
