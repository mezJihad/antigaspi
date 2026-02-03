using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Antigaspi.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUserVerificationRateLimiting : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "LastVerificationEmailSentAt",
                table: "Users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "VerificationEmailCount",
                table: "Users",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LastVerificationEmailSentAt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "VerificationEmailCount",
                table: "Users");
        }
    }
}
