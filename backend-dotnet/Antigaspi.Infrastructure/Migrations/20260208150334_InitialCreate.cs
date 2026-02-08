using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Antigaspi.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Cities",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    NameFr = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    NameAr = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    NameEn = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cities", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    FirstName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    LastName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Role = table.Column<int>(type: "integer", nullable: false),
                    IsEmailVerified = table.Column<bool>(type: "boolean", nullable: false),
                    OtpCode = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: true),
                    OtpExpiration = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    VerificationEmailCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    LastVerificationEmailSentAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PreferredLanguage = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Sellers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    StoreName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Street = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    City = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ZipCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Country = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Latitude = table.Column<double>(type: "double precision", nullable: true),
                    Longitude = table.Column<double>(type: "double precision", nullable: true),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    RejectionReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    SourceLanguage = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false, defaultValue: "fr")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sellers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Sellers_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Offers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SellerId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    PriceAmount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    PriceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    OriginalPriceAmount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    OriginalPriceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    PictureUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ExpirationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Category = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    SourceLanguage = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false, defaultValue: "fr")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Offers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Offers_Sellers_SellerId",
                        column: x => x.SellerId,
                        principalTable: "Sellers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OfferStatusHistory",
                columns: table => new
                {
                    OfferId = table.Column<Guid>(type: "uuid", nullable: false),
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    ChangedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    ChangedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Reason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OfferStatusHistory", x => new { x.OfferId, x.Id });
                    table.ForeignKey(
                        name: "FK_OfferStatusHistory_Offers_OfferId",
                        column: x => x.OfferId,
                        principalTable: "Offers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Cities",
                columns: new[] { "Id", "IsActive", "NameAr", "NameEn", "NameFr" },
                values: new object[,]
                {
                    { 1, true, "أكادير", "Agadir", "Agadir" },
                    { 2, true, "الحسيمة", "Al Hoceima", "Al Hoceima" },
                    { 3, true, "بني ملال", "Beni Mellal", "Beni Mellal" },
                    { 4, true, "برشيد", "Berrechid", "Berrechid" },
                    { 5, true, "الدار البيضاء", "Casablanca", "Casablanca" },
                    { 6, true, "الداخلة", "Dakhla", "Dakhla" },
                    { 7, true, "الجديدة", "El Jadida", "El Jadida" },
                    { 8, true, "الراشيدية", "Errachidia", "Errachidia" },
                    { 9, true, "الصويرة", "Essaouira", "Essaouira" },
                    { 10, true, "فاس", "Fes", "Fès" },
                    { 11, true, "كلميم", "Guelmim", "Guelmim" },
                    { 12, true, "إفران", "Ifrane", "Ifrane" },
                    { 13, true, "القنيطرة", "Kenitra", "Kénitra" },
                    { 14, true, "الخميسات", "Khemisset", "Khémisset" },
                    { 15, true, "خنيفرة", "Khenifra", "Khénifra" },
                    { 16, true, "خريبكة", "Khouribga", "Khouribga" },
                    { 17, true, "العيون", "Laayoune", "Laâyoune" },
                    { 18, true, "العرائش", "Larache", "Larache" },
                    { 19, true, "مراكش", "Marrakech", "Marrakech" },
                    { 20, true, "مكناس", "Meknes", "Meknès" },
                    { 21, true, "المحمدية", "Mohammedia", "Mohammedia" },
                    { 22, true, "الناظور", "Nador", "Nador" },
                    { 23, true, "ورزازات", "Ouarzazate", "Ouarzazate" },
                    { 24, true, "وجدة", "Oujda", "Oujda" },
                    { 25, true, "الرباط", "Rabat", "Rabat" },
                    { 26, true, "آسفي", "Safi", "Safi" },
                    { 27, true, "سلا", "Sale", "Salé" },
                    { 28, true, "سطات", "Settat", "Settat" },
                    { 29, true, "سيدي قاسم", "Sidi Kacem", "Sidi Kacem" },
                    { 30, true, "سيدي سليمان", "Sidi Slimane", "Sidi Slimane" },
                    { 31, true, "طنجة", "Tangier", "Tanger" },
                    { 32, true, "طانطان", "Tan-Tan", "Tan-Tan" },
                    { 33, true, "تاونات", "Taounate", "Taounate" },
                    { 34, true, "تارودانت", "Taroudant", "Taroudant" },
                    { 35, true, "تازة", "Taza", "Taza" },
                    { 36, true, "تمارة", "Temara", "Témara" },
                    { 37, true, "تطوان", "Tetouan", "Tétouan" },
                    { 38, true, "تيزنيت", "Tiznit", "Tiznit" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Offers_SellerId",
                table: "Offers",
                column: "SellerId");

            migrationBuilder.CreateIndex(
                name: "IX_Sellers_UserId",
                table: "Sellers",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Cities");

            migrationBuilder.DropTable(
                name: "OfferStatusHistory");

            migrationBuilder.DropTable(
                name: "Offers");

            migrationBuilder.DropTable(
                name: "Sellers");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
