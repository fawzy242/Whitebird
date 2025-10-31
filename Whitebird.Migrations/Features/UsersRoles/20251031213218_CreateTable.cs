using FluentMigrator;

namespace Whitebird.Migrations.Features.UsersRoles
{
    [Migration(20251031213218)]
    public class CreateTable : Migration
    {
        public override void Up()
        {
            Execute.Sql(@"
                IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='UsersRoles' AND xtype='U')
                CREATE TABLE [dbo].[UsersRoles] (
                    [Id] INT IDENTITY(1,1) PRIMARY KEY,
                    [Name] NVARCHAR(255) NOT NULL,
                    [CreatedDate] DATETIME NOT NULL DEFAULT GETDATE()
                );
            ");
        }

        public override void Down()
        {
            Execute.Sql(@"
                IF EXISTS (SELECT * FROM sysobjects WHERE name='UsersRoles' AND xtype='U')
                DROP TABLE [dbo].[UsersRoles];
            ");
        }
    }
}
