const ExcelJS = require('exceljs');

const HEADERS = {
  name: 'نام',
  lastName: 'نام‌خانوادگی',
  nationalCode: 'کد ملی',
  phone: 'موبایل',
  email: 'ایمیل',
  department: 'دپارتمان',
  employeeCode: 'کد کارمندی',
  jobTitle: 'سمت'
};

const parseEmployeesFromExcel = async (buffer) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const worksheet = workbook.worksheets[0];
  
  const employees = [];
  const headerRow = worksheet.getRow(1);
  const headerMap = {};
  
  headerRow.eachCell((cell, colNumber) => {
    const value = cell.value?.toString().trim();
    for (const [key, persianHeader] of Object.entries(HEADERS)) {
      if (value === persianHeader) headerMap[colNumber] = key;
    }
  });

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    
    const emp = {};
    row.eachCell((cell, colNumber) => {
      const key = headerMap[colNumber];
      if (key) emp[key] = cell.value?.toString().trim() || null;
    });
    
    if (emp.nationalCode || emp.email) employees.push(emp);
  });

  return employees;
};

const generateEmployeesExcel = async (employees) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('کارمندان');

  worksheet.columns = [
    { header: 'کد کارمندی', key: 'employeeCode', width: 15 },
    { header: 'سمت', key: 'jobTitle', width: 20 },
    { header: 'دپارتمان', key: 'department', width: 20 },
    { header: 'وضعیت', key: 'status', width: 12 },
    { header: 'تاریخ عضویت', key: 'joinedAt', width: 15 },
    { header: 'یارانه روزانه', key: 'dailySubsidyLimit', width: 15 },
    { header: 'درصد یارانه', key: 'subsidyPercentage', width: 12 }
  ];

  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).alignment = { horizontal: 'center' };

  employees.forEach(emp => {
    worksheet.addRow({
      employeeCode: emp.employeeCode,
      jobTitle: emp.jobTitle,
      department: emp.department?.name || '',
      status: emp.status === 'active' ? 'فعال' : 'غیرفعال',
      joinedAt: emp.joinedAt,
      dailySubsidyLimit: emp.dailySubsidyLimit,
      subsidyPercentage: emp.subsidyPercentage
    });
  });

  return workbook.xlsx.writeBuffer();
};

module.exports = { parseEmployeesFromExcel, generateEmployeesExcel };
