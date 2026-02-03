using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Antigaspi.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCitiesTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Cities",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NameFr = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    NameAr = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cities", x => x.Id);
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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Cities");
        }
    }
}
