// File: ReportsService.cs
using OfficeOpenXml;
using OfficeOpenXml.Style;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Reflection;
using Whitebird.App.Features.Common.Service;
using Whitebird.App.Features.Reports.Interfaces;
using Whitebird.Domain.Features.Reports.View;
using Whitebird.Infra.Features.AssetTransactions;
using Whitebird.Infra.Features.Reports;

namespace Whitebird.App.Features.Reports.Service
{
    public class ReportsService : IReportsService
    {
        private readonly IReportsReps _repository;

        public ReportsService(IReportsReps repository)
        {
            _repository = repository;
            ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;
        }

        public async Task<Result<IEnumerable<ReportsAssetTransactionViewModel>>> GetReportDataAsync()
        {
            try
            {
                var data = await _repository.GetAssetTransactionReportsAsync();
                return Result<IEnumerable<ReportsAssetTransactionViewModel>>.Success(data);
            }
            catch (Exception ex)
            {
                return Result<IEnumerable<ReportsAssetTransactionViewModel>>.Failure($"Failed to get report data: {ex.Message}");
            }
        }

        public async Task<Result<byte[]>> GenerateExcelReportAsync()
        {
            try
            {
                var data = await _repository.GetAssetTransactionReportsAsync();

                using var package = new ExcelPackage();
                var worksheet = package.Workbook.Worksheets.Add("Asset Transaction Report");

                // Add title
                var titleCell = worksheet.Cells["A1:M1"];
                titleCell.Merge = true;
                titleCell.Value = "Asset Transaction Report";
                titleCell.Style.Font.Bold = true;
                titleCell.Style.Font.Size = 16;
                titleCell.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                titleCell.Style.VerticalAlignment = ExcelVerticalAlignment.Center;

                // Add generated date
                var dateCell = worksheet.Cells["A2:M2"];
                dateCell.Merge = true;
                dateCell.Value = $"Generated on: {DateTime.Now:yyyy-MM-dd HH:mm:ss}";
                dateCell.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                dateCell.Style.Font.Italic = true;

                // Add headers
                AddHeaders(worksheet, 3);

                // Add data
                AddData(worksheet, data, 4);

                // Auto fit columns
                worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();

                // Set borders for all cells with data
                var dataRange = worksheet.Cells[
                    worksheet.Dimension.Start.Row,
                    worksheet.Dimension.Start.Column,
                    worksheet.Dimension.End.Row,
                    worksheet.Dimension.End.Column
                ];

                dataRange.Style.Border.Top.Style = ExcelBorderStyle.Thin;
                dataRange.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
                dataRange.Style.Border.Left.Style = ExcelBorderStyle.Thin;
                dataRange.Style.Border.Right.Style = ExcelBorderStyle.Thin;

                return Result<byte[]>.Success(package.GetAsByteArray());
            }
            catch (Exception ex)
            {
                return Result<byte[]>.Failure($"Failed to generate Excel report: {ex.Message}");
            }
        }

        private void AddHeaders(ExcelWorksheet worksheet, int startRow)
        {
            var properties = typeof(ReportsAssetTransactionViewModel).GetProperties();
            int col = 1;

            foreach (var property in properties)
            {
                var displayNameAttr = property.GetCustomAttribute<DisplayNameAttribute>();
                var displayAttr = displayNameAttr != null ? displayNameAttr.DisplayName : property.GetCustomAttribute<DisplayAttribute>()?.Name;

                var headerName = displayAttr ?? property.Name;

                var cell = worksheet.Cells[startRow, col];
                cell.Value = headerName;
                cell.Style.Font.Bold = true;
                cell.Style.Fill.PatternType = ExcelFillStyle.Solid;
                cell.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);
                cell.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                cell.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                cell.Style.Border.BorderAround(ExcelBorderStyle.Thin);

                col++;
            }
        }

        private void AddData(ExcelWorksheet worksheet, IEnumerable<ReportsAssetTransactionViewModel> data, int startRow)
        {
            var properties = typeof(ReportsAssetTransactionViewModel).GetProperties();
            int row = startRow;

            foreach (var item in data)
            {
                int col = 1;
                foreach (var property in properties)
                {
                    var value = property.GetValue(item);
                    var cell = worksheet.Cells[row, col];

                    // Format based on property type
                    if (value is DateTime dateTimeValue)
                    {
                        cell.Value = dateTimeValue;

                        // Set format for date columns
                        if (property.Name.Contains("Date"))
                        {
                            if (property.Name == "TransactionDate")
                            {
                                cell.Style.Numberformat.Format = "yyyy-mm-dd hh:mm:ss";
                            }
                            else
                            {
                                cell.Style.Numberformat.Format = "yyyy-mm-dd";
                            }
                        }
                    }
                    else if (value is decimal decimalValue)
                    {
                        cell.Value = decimalValue;
                        cell.Style.Numberformat.Format = "#,##0.00";
                        cell.Style.HorizontalAlignment = ExcelHorizontalAlignment.Right;
                    }
                    else
                    {
                        cell.Value = value;
                        cell.Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;
                    }

                    cell.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                    col++;
                }
                row++;
            }
        }
    }
}