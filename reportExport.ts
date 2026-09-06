import { ReportResponse } from '../types/reportTypes';

/**
 * Formats a currency number in INR format (₹XX,XXX)
 */
export const formatINR = (val: number): string => {
  const formatted = Math.abs(Math.round(val)).toLocaleString('en-IN');
  return `${val < 0 ? '-' : ''}₹${formatted}`;
};

/**
 * Exports complete financial report to CSV
 */
export const exportReportToCSV = (report: ReportResponse) => {
  const {
    period,
    summary,
    income,
    expenses,
    transactions,
    savingsGoals,
    upcomingBills,
    accounts = [],
    cards = [],
    transfers = [],
    financialAnalysis,
  } = report;

  let csv = 'BUDGETBUDDY COMPLETE FINANCIAL STATEMENT REPORT\n';
  csv += `Report Period:,"${period.startDate} to ${period.endDate}"\n`;
  csv += `Generated On:,"${new Date(report.lastUpdated).toLocaleString('en-IN')}"\n\n`;

  // 1. Summary
  csv += '=== EXECUTIVE FINANCIAL SUMMARY ===\n';
  csv += `Total Income,${summary.totalIncome}\n`;
  csv += `Total Expenses,${summary.totalExpenses}\n`;
  csv += `Net Current Balance,${summary.balance}\n`;
  csv += `Total Savings,${summary.savings}\n`;
  csv += `Savings Rate,${summary.savingsRate}%\n`;
  csv += `Expense Ratio,${summary.expenseRatio}%\n`;
  csv += `Total Budget,${summary.totalBudget}\n`;
  csv += `Budget Used,${summary.budgetUsed}\n`;
  csv += `Budget Remaining,${summary.budgetRemaining}\n`;
  csv += `Budget Usage,${summary.budgetPercentage}%\n`;
  csv += `Budget Health Status,${summary.budgetHealthStatus}\n\n`;

  // 2. Financial Analysis
  csv += '=== FINANCIAL ANALYSIS & RATIOS ===\n';
  csv += `Average Daily Spending,${financialAnalysis.averageDailySpending}\n`;
  csv += `Average Income per Record,${financialAnalysis.averageIncome}\n`;
  csv += `Average Expense per Record,${financialAnalysis.averageExpense}\n`;
  if (financialAnalysis.highestIncome) {
    csv += `Highest Income Source,"${financialAnalysis.highestIncome.source}",${financialAnalysis.highestIncome.amount},"${financialAnalysis.highestIncome.date}"\n`;
  }
  if (financialAnalysis.highestExpense) {
    csv += `Highest Expense Category,"${financialAnalysis.highestExpense.category}",${financialAnalysis.highestExpense.amount},"${financialAnalysis.highestExpense.date}","${financialAnalysis.highestExpense.description}"\n`;
  }
  csv += '\n';

  // 3. Income Records Table
  csv += '=== ITEMISED INCOME RECORDS ===\n';
  csv += 'Date,Source,Income Type,Bank,Payment Method,Description,Amount\n';
  income.records.forEach((inc) => {
    csv += `"${inc.date}","${inc.source}","${inc.incomeType}","${inc.bank}","${inc.paymentMethod}","${inc.description.replace(/"/g, '""')}",${inc.amount}\n`;
  });
  csv += '\n';

  // 4. Expense Records Table
  csv += '=== ITEMISED EXPENSE RECORDS ===\n';
  csv += 'Date,Category,Expense Type,Bank,Payment Method,Description,Amount\n';
  expenses.records.forEach((exp) => {
    csv += `"${exp.date}","${exp.category}","${exp.expenseType}","${exp.bank}","${exp.paymentMethod}","${exp.description.replace(/"/g, '""')}",${exp.amount}\n`;
  });
  csv += '\n';

  // 5. Savings Goals
  csv += '=== SAVINGS GOALS REPORT ===\n';
  csv += 'Goal Name,Target Amount,Saved Amount,Remaining Amount,Progress (%),Target Date,Status\n';
  savingsGoals.forEach((g) => {
    csv += `"${g.title}",${g.targetAmount},${g.savedAmount},${g.remainingAmount},${g.progress}%,"${g.targetDate}","${g.status}"\n`;
  });
  csv += '\n';

  // 6. Accounts & Banks
  if (accounts.length > 0) {
    csv += '=== ACCOUNTS & BANKS REPORT ===\n';
    csv += 'Account Name,Bank / Institution,Type,Last 4 Digits,Balance\n';
    accounts.forEach((a) => {
      csv += `"${a.name}","${a.bankName}","${a.accountType}","${a.lastFourDigits}",${a.balance}\n`;
    });
    csv += '\n';
  }

  // 7. Cards & Vault
  if (cards.length > 0) {
    csv += '=== CARDS & VAULT REPORT ===\n';
    csv += 'Card Name,Issuer Bank,Type,Last 4,Credit Limit,Balance/Due,Status\n';
    cards.forEach((c) => {
      csv += `"${c.cardName}","${c.bankName}","${c.cardType}","${c.last4}",${c.creditLimit || 0},${c.balanceOrDue},"${c.isFrozen ? 'Frozen' : 'Active'}"\n`;
    });
    csv += '\n';
  }

  // 8. P2P Transfers
  if (transfers.length > 0) {
    csv += '=== P2P TRANSFERS REPORT ===\n';
    csv += 'Date,Person / Entity,Type,Category,Payment Mode,Status,Amount\n';
    transfers.forEach((t) => {
      csv += `"${t.date}","${t.personName}","${t.type}","${t.category}","${t.paymentMode}","${t.status}",${t.amount}\n`;
    });
    csv += '\n';
  }

  // 9. Upcoming Bills
  csv += '=== UPCOMING BILLS REPORT ===\n';
  csv += 'Bill Name,Due Date,Amount,Category,Account,Status\n';
  upcomingBills.forEach((b) => {
    csv += `"${b.billName}","${b.dueDate}",${b.amount},"${b.category}","${b.accountName}","${b.status}"\n`;
  });
  csv += '\n';

  // 10. Unified Transactions
  csv += '=== UNIFIED TRANSACTION AUDIT LEDGER ===\n';
  csv += 'Date,Type,Category/Source,Description,Bank,Payment Method,Amount\n';
  transactions.forEach((tx) => {
    csv += `"${tx.date}","${tx.type}","${tx.category}","${tx.description.replace(/"/g, '""')}","${tx.bank}","${tx.paymentMethod}",${tx.amount}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `BudgetBuddy_Financial_Report_${period.startDate}_to_${period.endDate}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Exports formatted Excel Spreadsheet report
 */
export const exportReportToExcel = (report: ReportResponse) => {
  const {
    period,
    summary,
    income,
    expenses,
    transactions,
    savingsGoals,
    upcomingBills,
    accounts = [],
    cards = [],
    transfers = [],
  } = report;

  const sanitizeXml = (str: any) =>
    String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Bottom"/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>
  </Style>
  <Style ss:ID="HeaderStyle">
   <Font ss:FontName="Calibri" ss:Size="12" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#1E40AF" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="TitleStyle">
   <Font ss:FontName="Calibri" ss:Size="16" ss:Color="#1E40AF" ss:Bold="1"/>
  </Style>
  <Style ss:ID="BoldStyle">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1"/>
  </Style>
  <Style ss:ID="CurrencyStyle">
   <NumberFormat ss:Format="₹#,##0"/>
  </Style>
 </Styles>

 <!-- Sheet 1: Executive Summary -->
 <Worksheet ss:Name="Executive Summary">
  <Table>
   <Column ss:Width="180"/>
   <Column ss:Width="140"/>
   <Row>
    <Cell ss:StyleID="TitleStyle"><Data ss:Type="String">BudgetBuddy Financial Report</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Report Period:</Data></Cell>
    <Cell ss:StyleID="BoldStyle"><Data ss:Type="String">${sanitizeXml(period.startDate)} to ${sanitizeXml(period.endDate)}</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Generated At:</Data></Cell>
    <Cell><Data ss:Type="String">${sanitizeXml(new Date(report.lastUpdated).toLocaleString('en-IN'))}</Data></Cell>
   </Row>
   <Row></Row>
   <Row>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Metric</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Value</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Total Income</Data></Cell>
    <Cell ss:StyleID="CurrencyStyle"><Data ss:Type="Number">${summary.totalIncome}</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Total Expenses</Data></Cell>
    <Cell ss:StyleID="CurrencyStyle"><Data ss:Type="Number">${summary.totalExpenses}</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Current Net Balance</Data></Cell>
    <Cell ss:StyleID="CurrencyStyle"><Data ss:Type="Number">${summary.balance}</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Total Savings</Data></Cell>
    <Cell ss:StyleID="CurrencyStyle"><Data ss:Type="Number">${summary.savings}</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Savings Rate</Data></Cell>
    <Cell><Data ss:Type="String">${summary.savingsRate}%</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Expense Ratio</Data></Cell>
    <Cell><Data ss:Type="String">${summary.expenseRatio}%</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Total Monthly Budget</Data></Cell>
    <Cell ss:StyleID="CurrencyStyle"><Data ss:Type="Number">${summary.totalBudget}</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Budget Used</Data></Cell>
    <Cell ss:StyleID="CurrencyStyle"><Data ss:Type="Number">${summary.budgetUsed}</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Budget Remaining</Data></Cell>
    <Cell ss:StyleID="CurrencyStyle"><Data ss:Type="Number">${summary.budgetRemaining}</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Budget Usage %</Data></Cell>
    <Cell><Data ss:Type="String">${summary.budgetPercentage}%</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Budget Health Status</Data></Cell>
    <Cell ss:StyleID="BoldStyle"><Data ss:Type="String">${sanitizeXml(summary.budgetHealthStatus)}</Data></Cell>
   </Row>
  </Table>
 </Worksheet>

 <!-- Sheet 2: Income Records -->
 <Worksheet ss:Name="Income">
  <Table>
   <Column ss:Width="100"/>
   <Column ss:Width="120"/>
   <Column ss:Width="120"/>
   <Column ss:Width="120"/>
   <Column ss:Width="120"/>
   <Column ss:Width="180"/>
   <Column ss:Width="110"/>
   <Row>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Date</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Source</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Income Type</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Bank</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Payment Method</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Description</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Amount (INR)</Data></Cell>
   </Row>
   ${income.records
     .map(
       (i) => `
   <Row>
    <Cell><Data ss:Type="String">${sanitizeXml(i.date)}</Data></Cell>
    <Cell><Data ss:Type="String">${sanitizeXml(i.source)}</Data></Cell>
    <Cell><Data ss:Type="String">${sanitizeXml(i.incomeType)}</Data></Cell>
    <Cell><Data ss:Type="String">${sanitizeXml(i.bank)}</Data></Cell>
    <Cell><Data ss:Type="String">${sanitizeXml(i.paymentMethod)}</Data></Cell>
    <Cell><Data ss:Type="String">${sanitizeXml(i.description)}</Data></Cell>
    <Cell ss:StyleID="CurrencyStyle"><Data ss:Type="Number">${i.amount}</Data></Cell>
   </Row>`
     )
     .join('')}
  </Table>
 </Worksheet>

 <!-- Sheet 3: Expense Records -->
 <Worksheet ss:Name="Expenses">
  <Table>
   <Column ss:Width="100"/>
   <Column ss:Width="120"/>
   <Column ss:Width="120"/>
   <Column ss:Width="120"/>
   <Column ss:Width="120"/>
   <Column ss:Width="180"/>
   <Column ss:Width="110"/>
   <Row>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Date</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Category</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Expense Type</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Bank</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Payment Method</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Description</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Amount (INR)</Data></Cell>
   </Row>
   ${expenses.records
     .map(
       (e) => `
   <Row>
    <Cell><Data ss:Type="String">${sanitizeXml(e.date)}</Data></Cell>
    <Cell><Data ss:Type="String">${sanitizeXml(e.category)}</Data></Cell>
    <Cell><Data ss:Type="String">${sanitizeXml(e.expenseType)}</Data></Cell>
    <Cell><Data ss:Type="String">${sanitizeXml(e.bank)}</Data></Cell>
    <Cell><Data ss:Type="String">${sanitizeXml(e.paymentMethod)}</Data></Cell>
    <Cell><Data ss:Type="String">${sanitizeXml(e.description)}</Data></Cell>
    <Cell ss:StyleID="CurrencyStyle"><Data ss:Type="Number">${e.amount}</Data></Cell>
   </Row>`
     )
     .join('')}
  </Table>
 </Worksheet>

 <!-- Sheet 4: Accounts & Banks -->
 <Worksheet ss:Name="Accounts &amp; Banks">
  <Table>
   <Column ss:Width="160"/>
   <Column ss:Width="140"/>
   <Column ss:Width="110"/>
   <Column ss:Width="110"/>
   <Column ss:Width="130"/>
   <Row>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Account Name</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Institution / Bank</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Type</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Last 4 Digits</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Balance (INR)</Data></Cell>
   </Row>
   ${accounts
     .map(
       (a) => `
   <Row>
    <Cell><Data ss:Type="String">${sanitizeXml(a.name)}</Data></Cell>
    <Cell><Data ss:Type="String">${sanitizeXml(a.bankName)}</Data></Cell>
    <Cell><Data ss:Type="String">${sanitizeXml(a.accountType)}</Data></Cell>
    <Cell><Data ss:Type="String">${sanitizeXml(a.lastFourDigits)}</Data></Cell>
    <Cell ss:StyleID="CurrencyStyle"><Data ss:Type="Number">${a.balance}</Data></Cell>
   </Row>`
     )
     .join('')}
  </Table>
 </Worksheet>

 <!-- Sheet 5: Cards & Vault -->
 <Worksheet ss:Name="Cards &amp; Vault">
  <Table>
   <Column ss:Width="160"/>
   <Column ss:Width="140"/>
   <Column ss:Width="100"/>
   <Column ss:Width="100"/>
   <Column ss:Width="120"/>
   <Column ss:Width="120"/>
   <Column ss:Width="100"/>
   <Row>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Card Name</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Bank Name</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Type</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Last 4</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Credit Limit</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Balance / Due</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Status</Data></Cell>
   </Row>
   ${cards
     .map(
       (c) => `
   <Row>
    <Cell><Data ss:Type="String">${sanitizeXml(c.cardName)}</Data></Cell>
    <Cell><Data ss:Type="String">${sanitizeXml(c.bankName)}</Data></Cell>
    <Cell><Data ss:Type="String">${sanitizeXml(c.cardType)}</Data></Cell>
    <Cell><Data ss:Type="String">${sanitizeXml(c.last4)}</Data></Cell>
    <Cell ss:StyleID="CurrencyStyle"><Data ss:Type="Number">${c.creditLimit || 0}</Data></Cell>
    <Cell ss:StyleID="CurrencyStyle"><Data ss:Type="Number">${c.balanceOrDue}</Data></Cell>
    <Cell><Data ss:Type="String">${c.isFrozen ? 'Frozen' : 'Active'}</Data></Cell>
   </Row>`
     )
     .join('')}
  </Table>
 </Worksheet>

 <!-- Sheet 6: P2P Transfers -->
 <Worksheet ss:Name="P2P Transfers">
  <Table>
   <Column ss:Width="100"/>
   <Column ss:Width="140"/>
   <Column ss:Width="90"/>
   <Column ss:Width="110"/>
   <Column ss:Width="110"/>
   <Column ss:Width="100"/>
   <Column ss:Width="110"/>
   <Row>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Date</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Person</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Type</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Category</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Payment Mode</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Status</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Amount</Data></Cell>
   </Row>
   ${transfers
     .map(
       (t) => `
   <Row>
    <Cell><Data ss:Type="String">${sanitizeXml(t.date)}</Data></Cell>
    <Cell><Data ss:Type="String">${sanitizeXml(t.personName)}</Data></Cell>
    <Cell><Data ss:Type="String">${sanitizeXml(t.type)}</Data></Cell>
    <Cell><Data ss:Type="String">${sanitizeXml(t.category)}</Data></Cell>
    <Cell><Data ss:Type="String">${sanitizeXml(t.paymentMode)}</Data></Cell>
    <Cell><Data ss:Type="String">${sanitizeXml(t.status)}</Data></Cell>
    <Cell ss:StyleID="CurrencyStyle"><Data ss:Type="Number">${t.amount}</Data></Cell>
   </Row>`
     )
     .join('')}
  </Table>
 </Worksheet>

 <!-- Sheet 7: Savings Goals -->
 <Worksheet ss:Name="Savings Goals">
  <Table>
   <Column ss:Width="140"/>
   <Column ss:Width="110"/>
   <Column ss:Width="110"/>
   <Column ss:Width="110"/>
   <Column ss:Width="90"/>
   <Column ss:Width="110"/>
   <Column ss:Width="110"/>
   <Row>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Goal Name</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Target Amount</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Saved Amount</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Remaining</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Progress</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Target Date</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Status</Data></Cell>
   </Row>
   ${savingsGoals
     .map(
       (g) => `
   <Row>
    <Cell><Data ss:Type="String">${sanitizeXml(g.title)}</Data></Cell>
    <Cell ss:StyleID="CurrencyStyle"><Data ss:Type="Number">${g.targetAmount}</Data></Cell>
    <Cell ss:StyleID="CurrencyStyle"><Data ss:Type="Number">${g.savedAmount}</Data></Cell>
    <Cell ss:StyleID="CurrencyStyle"><Data ss:Type="Number">${g.remainingAmount}</Data></Cell>
    <Cell><Data ss:Type="String">${g.progress}%</Data></Cell>
    <Cell><Data ss:Type="String">${sanitizeXml(g.targetDate)}</Data></Cell>
    <Cell ss:StyleID="BoldStyle"><Data ss:Type="String">${sanitizeXml(g.status)}</Data></Cell>
   </Row>`
     )
     .join('')}
  </Table>
 </Worksheet>

 <!-- Sheet 8: Upcoming Bills -->
 <Worksheet ss:Name="Bills Tracker">
  <Table>
   <Column ss:Width="140"/>
   <Column ss:Width="110"/>
   <Column ss:Width="110"/>
   <Column ss:Width="110"/>
   <Column ss:Width="120"/>
   <Column ss:Width="100"/>
   <Row>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Bill Name</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Due Date</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Amount</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Category</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Account</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Status</Data></Cell>
   </Row>
   ${upcomingBills
     .map(
       (b) => `
   <Row>
    <Cell><Data ss:Type="String">${sanitizeXml(b.billName)}</Data></Cell>
    <Cell><Data ss:Type="String">${sanitizeXml(b.dueDate)}</Data></Cell>
    <Cell ss:StyleID="CurrencyStyle"><Data ss:Type="Number">${b.amount}</Data></Cell>
    <Cell><Data ss:Type="String">${sanitizeXml(b.category)}</Data></Cell>
    <Cell><Data ss:Type="String">${sanitizeXml(b.accountName)}</Data></Cell>
    <Cell ss:StyleID="BoldStyle"><Data ss:Type="String">${sanitizeXml(b.status)}</Data></Cell>
   </Row>`
     )
     .join('')}
  </Table>
 </Worksheet>

 <!-- Sheet 9: All Transactions Ledger -->
 <Worksheet ss:Name="All Transactions">
  <Table>
   <Column ss:Width="100"/>
   <Column ss:Width="90"/>
   <Column ss:Width="130"/>
   <Column ss:Width="180"/>
   <Column ss:Width="120"/>
   <Column ss:Width="120"/>
   <Column ss:Width="110"/>
   <Row>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Date</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Type</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Category / Source</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Description</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Bank</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Payment Method</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Amount</Data></Cell>
   </Row>
   ${transactions
     .map(
       (t) => `
   <Row>
    <Cell><Data ss:Type="String">${sanitizeXml(t.date)}</Data></Cell>
    <Cell ss:StyleID="BoldStyle"><Data ss:Type="String">${sanitizeXml(t.type)}</Data></Cell>
    <Cell><Data ss:Type="String">${sanitizeXml(t.category)}</Data></Cell>
    <Cell><Data ss:Type="String">${sanitizeXml(t.description)}</Data></Cell>
    <Cell><Data ss:Type="String">${sanitizeXml(t.bank)}</Data></Cell>
    <Cell><Data ss:Type="String">${sanitizeXml(t.paymentMethod)}</Data></Cell>
    <Cell ss:StyleID="CurrencyStyle"><Data ss:Type="Number">${t.amount}</Data></Cell>
   </Row>`
     )
     .join('')}
  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `BudgetBuddy_Financial_Workbook_${period.startDate}_to_${period.endDate}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Triggers clean browser print dialog with styled formatting
 */
export const printReport = () => {
  window.print();
};
