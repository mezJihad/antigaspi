using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Antigaspi.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class EnableCascadeDeleteOnOffers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Offers_Sellers_SellerId",
                table: "Offers");

            migrationBuilder.AddForeignKey(
                name: "FK_Offers_Sellers_SellerId",
                table: "Offers",
                column: "SellerId",
                principalTable: "Sellers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Offers_Sellers_SellerId",
                table: "Offers");

            migrationBuilder.AddForeignKey(
                name: "FK_Offers_Sellers_SellerId",
                table: "Offers",
                column: "SellerId",
                principalTable: "Sellers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
