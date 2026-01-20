using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Antigaspi.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOfferDateRange : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ExpirationDate",
                table: "Offers",
                newName: "StartDate");

            migrationBuilder.AddColumn<DateTime>(
                name: "EndDate",
                table: "Offers",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EndDate",
                table: "Offers");

            migrationBuilder.RenameColumn(
                name: "StartDate",
                table: "Offers",
                newName: "ExpirationDate");
        }
    }
}
