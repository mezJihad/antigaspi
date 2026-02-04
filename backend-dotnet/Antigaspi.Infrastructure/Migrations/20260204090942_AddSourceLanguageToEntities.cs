using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Antigaspi.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSourceLanguageToEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SourceLanguage",
                table: "Sellers",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "fr");

            migrationBuilder.AddColumn<string>(
                name: "SourceLanguage",
                table: "Offers",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "fr");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SourceLanguage",
                table: "Sellers");

            migrationBuilder.DropColumn(
                name: "SourceLanguage",
                table: "Offers");
        }
    }
}
