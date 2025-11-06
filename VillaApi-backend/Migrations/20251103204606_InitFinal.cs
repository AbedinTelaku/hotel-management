using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VillaApi.Migrations
{
    /// <inheritdoc />
    public partial class InitFinal : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "dbo");

            migrationBuilder.CreateTable(
                name: "BlockToken",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    MomentOfBlock = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ToDeleteRecordAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Token = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BlockToken", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Capability",
                schema: "dbo",
                columns: table => new
                {
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Capability", x => x.Code);
                });

            migrationBuilder.CreateTable(
                name: "LoginToken",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Token = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MomentOfLogin = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpireAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LoginToken", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Messages",
                schema: "dbo",
                columns: table => new
                {
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Messages", x => x.Code);
                });

            migrationBuilder.CreateTable(
                name: "Parameters",
                schema: "dbo",
                columns: table => new
                {
                    ParameterName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    ParameterValue = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Parameters", x => x.ParameterName);
                });

            migrationBuilder.CreateTable(
                name: "Product",
                schema: "dbo",
                columns: table => new
                {
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    Image = table.Column<byte[]>(type: "varbinary(max)", nullable: true),
                    ImageFormat = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OrderNo = table.Column<int>(type: "int", nullable: false),
                    Stock = table.Column<int>(type: "int", nullable: false),
                    EnteredBy = table.Column<int>(type: "int", nullable: false),
                    EnteredOn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Product", x => x.Code);
                });

            migrationBuilder.CreateTable(
                name: "RoomDetails",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoomMovementId = table.Column<int>(type: "int", nullable: false),
                    RoomTypeCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Hours = table.Column<int>(type: "int", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    IsDebt = table.Column<bool>(type: "bit", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: false),
                    CashierId = table.Column<int>(type: "int", nullable: true),
                    EnteredBy = table.Column<int>(type: "int", nullable: false),
                    EnteredOn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoomDetails", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RoomModel",
                schema: "dbo",
                columns: table => new
                {
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoomModel", x => x.Code);
                });

            migrationBuilder.CreateTable(
                name: "SuggestionCarName",
                schema: "dbo",
                columns: table => new
                {
                    CarName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SuggestionCarName", x => x.CarName);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Username = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Password = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    IsAdmin = table.Column<bool>(type: "bit", nullable: false),
                    IsLoggedIn = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FormCapability",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FormName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    CapabilityCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ControlName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FormCapability", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FormCapability_Capability_CapabilityCode",
                        column: x => x.CapabilityCode,
                        principalSchema: "dbo",
                        principalTable: "Capability",
                        principalColumn: "Code",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Payment",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DisplayText = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    IsMistake = table.Column<bool>(type: "bit", nullable: false),
                    IsForStaff = table.Column<bool>(type: "bit", nullable: false),
                    EmployeeId = table.Column<int>(type: "int", maxLength: 50, nullable: false),
                    EnteredOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RoomDetailsId = table.Column<int>(type: "int", nullable: true),
                    SupplyAndSellItemsId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payment", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Payment_Users_EmployeeId",
                        column: x => x.EmployeeId,
                        principalSchema: "dbo",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProductCategory",
                schema: "dbo",
                columns: table => new
                {
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    EnteredBy = table.Column<int>(type: "int", nullable: false),
                    EnteredOn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductCategory", x => x.Code);
                    table.ForeignKey(
                        name: "FK_ProductCategory_Users_EnteredBy",
                        column: x => x.EnteredBy,
                        principalSchema: "dbo",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Room",
                schema: "dbo",
                columns: table => new
                {
                    RoomNo = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    OrderNo = table.Column<int>(type: "int", nullable: false),
                    RoomModel = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    EnteredBy = table.Column<int>(type: "int", nullable: false),
                    EnteredOn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Room", x => x.RoomNo);
                    table.ForeignKey(
                        name: "FK_Room_Users_EnteredBy",
                        column: x => x.EnteredBy,
                        principalSchema: "dbo",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RoomPrice",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoomModel = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    RoomType = table.Column<string>(type: "nvarchar(5)", maxLength: 5, nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    EnteredBy = table.Column<int>(type: "int", nullable: false),
                    EnteredOn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoomPrice", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RoomPrice_Users_EnteredBy",
                        column: x => x.EnteredBy,
                        principalSchema: "dbo",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RoomType",
                schema: "dbo",
                columns: table => new
                {
                    Code = table.Column<string>(type: "nvarchar(5)", maxLength: 5, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Hours = table.Column<int>(type: "int", nullable: false),
                    IsCustom = table.Column<bool>(type: "bit", nullable: false),
                    IsExtra = table.Column<bool>(type: "bit", nullable: false),
                    EnteredBy = table.Column<int>(type: "int", nullable: false),
                    OrderNo = table.Column<int>(type: "int", nullable: false),
                    EnteredOn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoomType", x => x.Code);
                    table.ForeignKey(
                        name: "FK_RoomType_Users_EnteredBy",
                        column: x => x.EnteredBy,
                        principalSchema: "dbo",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FormAuthorization",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FormCapabilityId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FormAuthorization", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FormAuthorization_FormCapability_FormCapabilityId",
                        column: x => x.FormCapabilityId,
                        principalSchema: "dbo",
                        principalTable: "FormCapability",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FormAuthorization_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "dbo",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RoomMovement",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoomNo = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    EntryOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ClosedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsClosed = table.Column<bool>(type: "bit", nullable: false),
                    IsMistake = table.Column<bool>(type: "bit", nullable: false),
                    ClientPlateNo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ClientDocument = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ClientCarName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    EnteredBy = table.Column<int>(type: "int", nullable: false),
                    EnteredOn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoomMovement", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RoomMovement_Room_RoomNo",
                        column: x => x.RoomNo,
                        principalSchema: "dbo",
                        principalTable: "Room",
                        principalColumn: "RoomNo",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SupplyAndSell",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DateAndTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Total = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    IsSupply = table.Column<bool>(type: "bit", nullable: false),
                    IsFree = table.Column<bool>(type: "bit", nullable: false),
                    RoomMovementId = table.Column<int>(type: "int", nullable: true),
                    IsDebt = table.Column<bool>(type: "bit", nullable: false),
                    IsMistake = table.Column<bool>(type: "bit", nullable: false),
                    IsForStaff = table.Column<bool>(type: "bit", nullable: false),
                    Discount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    EnteredBy = table.Column<int>(type: "int", nullable: false),
                    EnteredOn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SupplyAndSell", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SupplyAndSell_RoomMovement_RoomMovementId",
                        column: x => x.RoomMovementId,
                        principalSchema: "dbo",
                        principalTable: "RoomMovement",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_SupplyAndSell_Users_EnteredBy",
                        column: x => x.EnteredBy,
                        principalSchema: "dbo",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SupplyAndSellItems",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SupplyAndSellId = table.Column<int>(type: "int", nullable: false),
                    ProductCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: false),
                    CashierId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SupplyAndSellItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SupplyAndSellItems_Product_ProductCode",
                        column: x => x.ProductCode,
                        principalSchema: "dbo",
                        principalTable: "Product",
                        principalColumn: "Code",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SupplyAndSellItems_SupplyAndSell_SupplyAndSellId",
                        column: x => x.SupplyAndSellId,
                        principalSchema: "dbo",
                        principalTable: "SupplyAndSell",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FormAuthorization_FormCapabilityId",
                schema: "dbo",
                table: "FormAuthorization",
                column: "FormCapabilityId");

            migrationBuilder.CreateIndex(
                name: "IX_FormAuthorization_UserId",
                schema: "dbo",
                table: "FormAuthorization",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_FormCapability_CapabilityCode",
                schema: "dbo",
                table: "FormCapability",
                column: "CapabilityCode");

            migrationBuilder.CreateIndex(
                name: "IX_Payment_EmployeeId",
                schema: "dbo",
                table: "Payment",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductCategory_EnteredBy",
                schema: "dbo",
                table: "ProductCategory",
                column: "EnteredBy");

            migrationBuilder.CreateIndex(
                name: "IX_Room_EnteredBy",
                schema: "dbo",
                table: "Room",
                column: "EnteredBy");

            migrationBuilder.CreateIndex(
                name: "IX_RoomMovement_RoomNo",
                schema: "dbo",
                table: "RoomMovement",
                column: "RoomNo");

            migrationBuilder.CreateIndex(
                name: "IX_RoomPrice_EnteredBy",
                schema: "dbo",
                table: "RoomPrice",
                column: "EnteredBy");

            migrationBuilder.CreateIndex(
                name: "IX_RoomType_EnteredBy",
                schema: "dbo",
                table: "RoomType",
                column: "EnteredBy");

            migrationBuilder.CreateIndex(
                name: "IX_SupplyAndSell_EnteredBy",
                schema: "dbo",
                table: "SupplyAndSell",
                column: "EnteredBy");

            migrationBuilder.CreateIndex(
                name: "IX_SupplyAndSell_RoomMovementId",
                schema: "dbo",
                table: "SupplyAndSell",
                column: "RoomMovementId");

            migrationBuilder.CreateIndex(
                name: "IX_SupplyAndSellItems_ProductCode",
                schema: "dbo",
                table: "SupplyAndSellItems",
                column: "ProductCode");

            migrationBuilder.CreateIndex(
                name: "IX_SupplyAndSellItems_SupplyAndSellId",
                schema: "dbo",
                table: "SupplyAndSellItems",
                column: "SupplyAndSellId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BlockToken",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "FormAuthorization",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "LoginToken",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "Messages",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "Parameters",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "Payment",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "ProductCategory",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "RoomDetails",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "RoomModel",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "RoomPrice",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "RoomType",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "SuggestionCarName",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "SupplyAndSellItems",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "FormCapability",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "Product",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "SupplyAndSell",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "Capability",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "RoomMovement",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "Room",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "Users",
                schema: "dbo");
        }
    }
}
