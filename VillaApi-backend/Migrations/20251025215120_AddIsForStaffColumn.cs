using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VillaApi.Migrations
{
    /// <inheritdoc />
    public partial class AddIsForStaffColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsForStaff",
                schema: "dbo",
                table: "SupplyAndSell",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsForStaff",
                schema: "dbo",
                table: "Payment",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsForStaff",
                schema: "dbo",
                table: "SupplyAndSell");

            migrationBuilder.DropColumn(
                name: "IsForStaff",
                schema: "dbo",
                table: "Payment");
        }
    }
}
