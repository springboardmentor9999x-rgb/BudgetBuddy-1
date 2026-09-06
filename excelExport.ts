import {
  UserProfile,
  ExpenseItem,
  IncomeItem,
  PersonTransfer,
  PaymentCard,
  BudgetLimit,
  SavingsGoal,
  FinancialAccount,
  TransactionUnified,
} from '../types/budget';
import { formatMoney } from '../data/categories';

/**
 * Generates and triggers download of an Excel XML SpreadsheetML (.xls) file.
 * This format is 100% natively recognized by Microsoft Excel, Apple Numbers,
 * LibreOffice, and Google Sheets without any third-party dependencies.
 */
function downloadExcelFile(filename: string, xmlContent: string) {
  const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.endsWith('.xls') ? filename : `${filename}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeXml(unsafe: any): string {
  if (unsafe === undefined || unsafe === null) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Download a professional Excel Voucher / Receipt for a SINGLE transaction
 */
export function exportSingleTransactionExcel(
  item: {
    id: string;
    type: 'expense' | 'income' | 'transfer';
    title: string;
    amount: number;
    date: string;
    categoryOrSource: string;
    paymentMode?: string;
    personName?: string;
    notes?: string;
    status?: string;
    createdAt?: string;
  },
  user: UserProfile
) {
  const typeLabel =
    item.type === 'expense'
      ? 'Expense Voucher'
      : item.type === 'income'
      ? 'Income Receipt'
      : 'Personal Transfer & Charge Note';

  const refNumber = `TXN-${item.id.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10)}`;
  const dateStr = item.date || new Date().toISOString().split('T')[0];

  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#1E293B"/>
  </Style>
  <Style ss:ID="Title">
   <Font ss:FontName="Calibri" ss:Size="16" ss:Bold="1" ss:Color="#0F172A"/>
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="Header">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#0F172A" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#0F172A"/>
   </Borders>
  </Style>
  <Style ss:ID="SubHeader">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#475569"/>
   <Interior ss:Color="#F1F5F9" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="Label">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#64748B"/>
  </Style>
  <Style ss:ID="Value">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#0F172A"/>
  </Style>
  <Style ss:ID="Amount">
   <Font ss:FontName="Calibri" ss:Size="14" ss:Bold="1" ss:Color="#0F172A"/>
   <NumberFormat ss:Format="#,##0.00"/>
  </Style>
  <Style ss:ID="AmountHeader">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#0F172A" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Transaction Voucher">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="160"/>
   <Column ss:Width="260"/>
   <Column ss:Width="140"/>
   <Column ss:Width="140"/>

   <Row ss:Height="30">
    <Cell ss:MergeAcross="3" ss:StyleID="Title">
     <Data ss:Type="String">BUDGETVAULT - ${escapeXml(typeLabel.toUpperCase())}</Data>
    </Cell>
   </Row>
   <Row>
    <Cell ss:MergeAcross="3" ss:StyleID="Value">
     <Data ss:Type="String">Account Holder: ${escapeXml(user.fullName)} (${escapeXml(user.email)})</Data>
    </Cell>
   </Row>
   <Row>
    <Cell ss:MergeAcross="3" ss:StyleID="Value">
     <Data ss:Type="String">Generated: ${new Date().toLocaleString()} | Currency: ${user.currency}</Data>
    </Cell>
   </Row>
   <Row><Cell><Data ss:Type="String"></Data></Cell></Row>

   <Row ss:Height="24">
    <Cell ss:MergeAcross="3" ss:StyleID="Header">
     <Data ss:Type="String">TRANSACTION SUMMARY &amp; AUDIT TRAIL</Data>
    </Cell>
   </Row>

   <Row>
    <Cell ss:StyleID="SubHeader"><Data ss:Type="String">Reference ID</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(refNumber)}</Data></Cell>
    <Cell ss:StyleID="SubHeader"><Data ss:Type="String">Date</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(item.date)}</Data></Cell>
   </Row>

   <Row>
    <Cell ss:StyleID="SubHeader"><Data ss:Type="String">Type</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(item.type.toUpperCase())}</Data></Cell>
    <Cell ss:StyleID="SubHeader"><Data ss:Type="String">Status</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(item.status || 'Completed')}</Data></Cell>
   </Row>

   <Row>
    <Cell ss:StyleID="SubHeader"><Data ss:Type="String">Description / Entity</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(item.title)}</Data></Cell>
    <Cell ss:StyleID="SubHeader"><Data ss:Type="String">Category / Source</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(item.categoryOrSource)}</Data></Cell>
   </Row>

   ${
     item.personName
       ? `
   <Row>
    <Cell ss:StyleID="SubHeader"><Data ss:Type="String">Person / Counterparty</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(item.personName)}</Data></Cell>
    <Cell ss:StyleID="SubHeader"><Data ss:Type="String">Payment Mode</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(item.paymentMode || 'Direct Transfer')}</Data></Cell>
   </Row>`
       : `
   <Row>
    <Cell ss:StyleID="SubHeader"><Data ss:Type="String">Payment Mode</Data></Cell>
    <Cell ss:MergeAcross="2" ss:StyleID="Value"><Data ss:Type="String">${escapeXml(item.paymentMode || 'UPI / Card')}</Data></Cell>
   </Row>`
   }

   <Row>
    <Cell ss:StyleID="SubHeader"><Data ss:Type="String">Notes &amp; Memo</Data></Cell>
    <Cell ss:MergeAcross="2" ss:StyleID="Value"><Data ss:Type="String">${escapeXml(item.notes || 'Verified Transaction')}</Data></Cell>
   </Row>

   <Row><Cell><Data ss:Type="String"></Data></Cell></Row>

   <Row ss:Height="24">
    <Cell ss:MergeAcross="2" ss:StyleID="Header"><Data ss:Type="String">TOTAL TRANSACTION AMOUNT</Data></Cell>
    <Cell ss:StyleID="AmountHeader"><Data ss:Type="String">${user.currency}</Data></Cell>
   </Row>

   <Row ss:Height="28">
    <Cell ss:MergeAcross="2" ss:StyleID="Value"><Data ss:Type="String">Net Cleared Amount (${user.currency})</Data></Cell>
    <Cell ss:StyleID="Amount"><Data ss:Type="Number">${item.amount}</Data></Cell>
   </Row>

   <Row><Cell><Data ss:Type="String"></Data></Cell></Row>
   <Row>
    <Cell ss:MergeAcross="3" ss:StyleID="Label">
     <Data ss:Type="String">* This electronic document is generated automatically by BudgetVault Personal Finance System.</Data>
    </Cell>
   </Row>
  </Table>
 </Worksheet>
</Workbook>`;

  const cleanDesc = (item.title || 'transaction').toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 20);
  const filename = `Receipt_${refNumber}_${cleanDesc}_${dateStr}.xls`;
  downloadExcelFile(filename, xml);
}

/**
 * Download comprehensive Person-to-Person Transfers & Charges Excel Workbook
 */
export function exportTransfersExcel(transfers: PersonTransfer[], user: UserProfile) {
  const rows = transfers.map((t) => `
   <Row>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(t.id)}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(t.date)}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(t.personName)}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(t.type.toUpperCase())}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(t.category)}</Data></Cell>
    <Cell ss:StyleID="Amount"><Data ss:Type="Number">${t.amount}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(t.status.toUpperCase())}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(t.paymentMode)}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(t.referenceNote || '')}</Data></Cell>
   </Row>`).join('\n');

  const totalSent = transfers.filter((t) => t.type === 'sent').reduce((s, t) => s + t.amount, 0);
  const totalReceived = transfers.filter((t) => t.type === 'received').reduce((s, t) => s + t.amount, 0);
  const netPeer = totalReceived - totalSent;

  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#1E293B"/>
  </Style>
  <Style ss:ID="Title">
   <Font ss:FontName="Calibri" ss:Size="16" ss:Bold="1" ss:Color="#0F172A"/>
  </Style>
  <Style ss:ID="Header">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#0F172A" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="Value">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#0F172A"/>
  </Style>
  <Style ss:ID="Amount">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#0F172A"/>
   <NumberFormat ss:Format="#,##0.00"/>
  </Style>
  <Style ss:ID="Total">
   <Font ss:FontName="Calibri" ss:Size="12" ss:Bold="1" ss:Color="#0F172A"/>
   <Interior ss:Color="#F1F5F9" ss:Pattern="Solid"/>
   <NumberFormat ss:Format="#,##0.00"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="P2P Transfers Ledger">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="110"/>
   <Column ss:Width="90"/>
   <Column ss:Width="160"/>
   <Column ss:Width="100"/>
   <Column ss:Width="140"/>
   <Column ss:Width="110"/>
   <Column ss:Width="100"/>
   <Column ss:Width="120"/>
   <Column ss:Width="220"/>

   <Row ss:Height="28">
    <Cell ss:MergeAcross="8" ss:StyleID="Title">
     <Data ss:Type="String">BUDGETVAULT - PERSONAL TRANSFERS &amp; CHARGES LEDGER (${user.currency})</Data>
    </Cell>
   </Row>
   <Row>
    <Cell ss:MergeAcross="8" ss:StyleID="Value">
     <Data ss:Type="String">Account Holder: ${escapeXml(user.fullName)} | Exported: ${new Date().toLocaleString()}</Data>
    </Cell>
   </Row>
   <Row>
    <Cell ss:MergeAcross="8" ss:StyleID="Value">
     <Data ss:Type="String">Summary: Total Received = ${user.currency} ${totalReceived.toLocaleString()} | Total Sent = ${user.currency} ${totalSent.toLocaleString()} | Net Position = ${user.currency} ${netPeer.toLocaleString()}</Data>
    </Cell>
   </Row>
   <Row><Cell><Data ss:Type="String"></Data></Cell></Row>

   <Row ss:Height="24">
    <Cell ss:StyleID="Header"><Data ss:Type="String">Transfer ID</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Date</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Person / Counterparty</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Type</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Category</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Amount (${user.currency})</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Status</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Payment Mode</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Reference / Notes</Data></Cell>
   </Row>

   ${rows}

   <Row><Cell><Data ss:Type="String"></Data></Cell></Row>
   <Row ss:Height="24">
    <Cell ss:MergeAcross="4" ss:StyleID="Total"><Data ss:Type="String">NET BALANCE POSITION</Data></Cell>
    <Cell ss:StyleID="Total"><Data ss:Type="Number">${netPeer}</Data></Cell>
    <Cell ss:MergeAcross="2" ss:StyleID="Total"><Data ss:Type="String">${netPeer >= 0 ? 'Surplus Receivable' : 'Outflow Obligation'}</Data></Cell>
   </Row>
  </Table>
 </Worksheet>
</Workbook>`;

  downloadExcelFile(`Personal_Transfers_Report_${new Date().toISOString().split('T')[0]}.xls`, xml);
}

/**
 * Download complete master multi-sheet Excel workbook for all Financial Data
 */
export function exportFullFinancialWorkbookExcel(
  expenses: ExpenseItem[],
  incomes: IncomeItem[],
  transfers: PersonTransfer[],
  cards: PaymentCard[],
  user: UserProfile
) {
  const expenseRows = expenses.map((e) => `
   <Row>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(e.id)}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(e.date)}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(e.description)}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(e.category)}</Data></Cell>
    <Cell ss:StyleID="Amount"><Data ss:Type="Number">${e.amount}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(e.paymentMethod || 'UPI / Card')}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(e.notes || '')}</Data></Cell>
   </Row>`).join('\n');

  const incomeRows = incomes.map((i) => `
   <Row>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(i.id)}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(i.date)}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(i.description)}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(i.source)}</Data></Cell>
    <Cell ss:StyleID="Amount"><Data ss:Type="Number">${i.amount}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${i.isRecurring ? 'Monthly Recurring' : 'One-time'}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(i.notes || '')}</Data></Cell>
   </Row>`).join('\n');

  const transferRows = transfers.map((t) => `
   <Row>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(t.id)}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(t.date)}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(t.personName)}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(t.type)}</Data></Cell>
    <Cell ss:StyleID="Amount"><Data ss:Type="Number">${t.amount}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(t.status)}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(t.paymentMode)}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(t.referenceNote || '')}</Data></Cell>
   </Row>`).join('\n');

  const cardRows = cards.map((c) => `
   <Row>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(c.cardName)}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(c.bankName)}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(c.cardType.toUpperCase())}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">•••• ${escapeXml(c.last4)}</Data></Cell>
    <Cell ss:StyleID="Amount"><Data ss:Type="Number">${c.balanceOrDue}</Data></Cell>
    <Cell ss:StyleID="Amount"><Data ss:Type="Number">${c.creditLimit || 0}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${c.isFrozen ? 'LOCKED / FROZEN' : 'ACTIVE'}</Data></Cell>
   </Row>`).join('\n');

  const totalExp = expenses.reduce((s, e) => s + e.amount, 0);
  const totalInc = incomes.reduce((s, i) => s + i.amount, 0);

  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#1E293B"/>
  </Style>
  <Style ss:ID="Title">
   <Font ss:FontName="Calibri" ss:Size="16" ss:Bold="1" ss:Color="#0F172A"/>
  </Style>
  <Style ss:ID="Header">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#0F172A" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="Value">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#0F172A"/>
  </Style>
  <Style ss:ID="Amount">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#0F172A"/>
   <NumberFormat ss:Format="#,##0.00"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Expenses">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="110"/>
   <Column ss:Width="90"/>
   <Column ss:Width="200"/>
   <Column ss:Width="140"/>
   <Column ss:Width="100"/>
   <Column ss:Width="120"/>
   <Column ss:Width="200"/>
   <Row ss:Height="24">
    <Cell ss:StyleID="Header"><Data ss:Type="String">ID</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Date</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Description</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Category</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Amount (${user.currency})</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Payment Mode</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Notes</Data></Cell>
   </Row>
   ${expenseRows}
  </Table>
 </Worksheet>
 <Worksheet ss:Name="Income">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="110"/>
   <Column ss:Width="90"/>
   <Column ss:Width="200"/>
   <Column ss:Width="140"/>
   <Column ss:Width="100"/>
   <Column ss:Width="120"/>
   <Column ss:Width="200"/>
   <Row ss:Height="24">
    <Cell ss:StyleID="Header"><Data ss:Type="String">ID</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Date</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Description</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Source</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Amount (${user.currency})</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Cadence</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Notes</Data></Cell>
   </Row>
   ${incomeRows}
  </Table>
 </Worksheet>
 <Worksheet ss:Name="Transfers &amp; Charges">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="110"/>
   <Column ss:Width="90"/>
   <Column ss:Width="160"/>
   <Column ss:Width="100"/>
   <Column ss:Width="100"/>
   <Column ss:Width="100"/>
   <Column ss:Width="120"/>
   <Column ss:Width="200"/>
   <Row ss:Height="24">
    <Cell ss:StyleID="Header"><Data ss:Type="String">ID</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Date</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Person</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Type</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Amount (${user.currency})</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Status</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Payment Mode</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Notes</Data></Cell>
   </Row>
   ${transferRows}
  </Table>
 </Worksheet>
 <Worksheet ss:Name="Cards &amp; Accounts">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="140"/>
   <Column ss:Width="120"/>
   <Column ss:Width="100"/>
   <Column ss:Width="100"/>
   <Column ss:Width="110"/>
   <Column ss:Width="110"/>
   <Column ss:Width="100"/>
   <Row ss:Height="24">
    <Cell ss:StyleID="Header"><Data ss:Type="String">Card / Account</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Bank Name</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Type</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Number</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Balance / Due</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Credit Limit</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Status</Data></Cell>
   </Row>
   ${cardRows}
  </Table>
 </Worksheet>
</Workbook>`;

  downloadExcelFile(`BudgetVault_Financial_Master_Report_${new Date().toISOString().split('T')[0]}.xls`, xml);
}

/**
 * Download a dedicated, up-to-date Excel report for Income Management
 */
export function exportIncomeExcelReport(
  incomes: IncomeItem[],
  user: UserProfile,
  filterLabel: string = 'All Time'
) {
  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
  const avgIncome = incomes.length > 0 ? Math.round(totalIncome / incomes.length) : 0;
  const highestIncome = incomes.length > 0 ? Math.max(...incomes.map((i) => i.amount)) : 0;
  const lowestIncome = incomes.length > 0 ? Math.min(...incomes.map((i) => i.amount)) : 0;

  const incomeRows = incomes
    .map(
      (i) => `
   <Row>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(i.id)}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(i.date)}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(i.description)}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(i.source)}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(i.bankName || 'Primary Account')}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(i.paymentMethod || 'Bank Transfer')}</Data></Cell>
    <Cell ss:StyleID="Amount"><Data ss:Type="Number">${i.amount}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${i.isRecurring ? 'Recurring' : 'One-time'}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(i.notes || '')}</Data></Cell>
   </Row>`
    )
    .join('\n');

  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#1E293B"/>
  </Style>
  <Style ss:ID="Title">
   <Font ss:FontName="Calibri" ss:Size="16" ss:Bold="1" ss:Color="#047857"/>
  </Style>
  <Style ss:ID="Header">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#047857" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="SubHeader">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#047857"/>
   <Interior ss:Color="#ECFDF5" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="Value">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#0F172A"/>
  </Style>
  <Style ss:ID="Amount">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#047857"/>
   <NumberFormat ss:Format="#,##0.00"/>
  </Style>
 </Styles>

 <!-- Summary Sheet -->
 <Worksheet ss:Name="Income Summary">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="200"/>
   <Column ss:Width="160"/>
   <Row ss:Height="26">
    <Cell ss:StyleID="Title"><Data ss:Type="String">BudgetBuddy Income Statement Report</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Report Filter Scope:</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(filterLabel)}</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Export Generated At:</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(new Date().toLocaleString('en-IN'))}</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">User / Entity:</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(user.fullName || user.email)}</Data></Cell>
   </Row>
   <Row></Row>
   <Row ss:Height="22">
    <Cell ss:StyleID="Header"><Data ss:Type="String">Income Key Performance Indicator</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Amount (${escapeXml(user.currency)})</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Total Inflow Revenue</Data></Cell>
    <Cell ss:StyleID="Amount"><Data ss:Type="Number">${totalIncome}</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Number of Revenue Streams</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="Number">${incomes.length}</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Average Inflow per Record</Data></Cell>
    <Cell ss:StyleID="Amount"><Data ss:Type="Number">${avgIncome}</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Highest Single Income Stream</Data></Cell>
    <Cell ss:StyleID="Amount"><Data ss:Type="Number">${highestIncome}</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Lowest Single Income Stream</Data></Cell>
    <Cell ss:StyleID="Amount"><Data ss:Type="Number">${lowestIncome}</Data></Cell>
   </Row>
  </Table>
 </Worksheet>

 <!-- Itemized Income Ledger Sheet -->
 <Worksheet ss:Name="Income Transactions">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="110"/>
   <Column ss:Width="90"/>
   <Column ss:Width="200"/>
   <Column ss:Width="140"/>
   <Column ss:Width="140"/>
   <Column ss:Width="130"/>
   <Column ss:Width="120"/>
   <Column ss:Width="100"/>
   <Column ss:Width="200"/>
   <Row ss:Height="24">
    <Cell ss:StyleID="Header"><Data ss:Type="String">Transaction ID</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Date</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Description</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Source / Category</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Account / Bank</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Payment Method</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Amount (${escapeXml(user.currency)})</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Stream Type</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Notes</Data></Cell>
   </Row>
   ${incomeRows}
  </Table>
 </Worksheet>
</Workbook>`;

  downloadExcelFile(`BudgetBuddy_Income_Report_${new Date().toISOString().split('T')[0]}.xls`, xml);
}

/**
 * Download a dedicated, up-to-date Excel report for Expenses Management
 */
export function exportExpensesExcelReport(
  expenses: ExpenseItem[],
  user: UserProfile,
  filterLabel: string = 'All Expenses'
) {
  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
  const avgExpense = expenses.length > 0 ? Math.round(totalExpense / expenses.length) : 0;
  const highestExpense = expenses.length > 0 ? Math.max(...expenses.map((e) => e.amount)) : 0;
  const lowestExpense = expenses.length > 0 ? Math.min(...expenses.map((e) => e.amount)) : 0;

  const expenseRows = expenses
    .map(
      (e) => `
   <Row>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(e.id)}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(e.date)}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(e.description)}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(e.category)}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(e.bankName || 'Primary Account')}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(e.paymentMethod || 'UPI')}</Data></Cell>
    <Cell ss:StyleID="Amount"><Data ss:Type="Number">${e.amount}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${e.recurring ? 'Recurring' : 'One-time'}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(e.notes || '')}</Data></Cell>
   </Row>`
    )
    .join('\n');

  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#1E293B"/>
  </Style>
  <Style ss:ID="Title">
   <Font ss:FontName="Calibri" ss:Size="16" ss:Bold="1" ss:Color="#BE123C"/>
  </Style>
  <Style ss:ID="Header">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#BE123C" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="Value">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#0F172A"/>
  </Style>
  <Style ss:ID="Amount">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#BE123C"/>
   <NumberFormat ss:Format="#,##0.00"/>
  </Style>
 </Styles>

 <Worksheet ss:Name="Expense Summary">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="200"/>
   <Column ss:Width="160"/>
   <Row ss:Height="26">
    <Cell ss:StyleID="Title"><Data ss:Type="String">BudgetBuddy Expense Statement Report</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Report Filter Scope:</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(filterLabel)}</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Export Generated At:</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(new Date().toLocaleString('en-IN'))}</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">User / Entity:</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(user.fullName || user.email)}</Data></Cell>
   </Row>
   <Row></Row>
   <Row ss:Height="22">
    <Cell ss:StyleID="Header"><Data ss:Type="String">Expense Key Performance Indicator</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Amount (${escapeXml(user.currency)})</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Total Expenditure Outflow</Data></Cell>
    <Cell ss:StyleID="Amount"><Data ss:Type="Number">${totalExpense}</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Total Expense Transactions</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="Number">${expenses.length}</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Average Expense per Item</Data></Cell>
    <Cell ss:StyleID="Amount"><Data ss:Type="Number">${avgExpense}</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Highest Single Expense</Data></Cell>
    <Cell ss:StyleID="Amount"><Data ss:Type="Number">${highestExpense}</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Lowest Single Expense</Data></Cell>
    <Cell ss:StyleID="Amount"><Data ss:Type="Number">${lowestExpense}</Data></Cell>
   </Row>
  </Table>
 </Worksheet>

 <Worksheet ss:Name="Itemized Expenses">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="110"/>
   <Column ss:Width="90"/>
   <Column ss:Width="200"/>
   <Column ss:Width="140"/>
   <Column ss:Width="140"/>
   <Column ss:Width="130"/>
   <Column ss:Width="120"/>
   <Column ss:Width="100"/>
   <Column ss:Width="200"/>
   <Row ss:Height="24">
    <Cell ss:StyleID="Header"><Data ss:Type="String">Expense ID</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Date</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Description</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Category</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Account / Bank</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Payment Method</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Amount (${escapeXml(user.currency)})</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Recurring</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Notes</Data></Cell>
   </Row>
   ${expenseRows}
  </Table>
 </Worksheet>
</Workbook>`;

  downloadExcelFile(`BudgetBuddy_Expenses_Report_${new Date().toISOString().split('T')[0]}.xls`, xml);
}

/**
 * Download a dedicated, up-to-date Excel report for Unified Transactions
 */
export function exportTransactionsExcelReport(
  transactions: any[],
  user: UserProfile,
  filterLabel: string = 'All Transactions'
) {
  const totalCount = transactions.length;
  const totalIn = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0);
  const totalOut = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0);
  const netBalance = totalIn - totalOut;

  const txRows = transactions
    .map(
      (t) => `
   <Row>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(t.id)}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(t.date)}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(t.type.toUpperCase())}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(t.description || t.categoryOrSource)}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(t.categoryOrSource || t.category)}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(t.bankName || t.bank || 'Primary Account')}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(t.paymentMethod || 'Direct')}</Data></Cell>
    <Cell ss:StyleID="Amount"><Data ss:Type="Number">${t.amount}</Data></Cell>
   </Row>`
    )
    .join('\n');

  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#1E293B"/>
  </Style>
  <Style ss:ID="Title">
   <Font ss:FontName="Calibri" ss:Size="16" ss:Bold="1" ss:Color="#1E40AF"/>
  </Style>
  <Style ss:ID="Header">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#1E40AF" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="Value">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#0F172A"/>
  </Style>
  <Style ss:ID="Amount">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#0F172A"/>
   <NumberFormat ss:Format="#,##0.00"/>
  </Style>
 </Styles>

 <Worksheet ss:Name="Transactions Ledger">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="110"/>
   <Column ss:Width="90"/>
   <Column ss:Width="80"/>
   <Column ss:Width="200"/>
   <Column ss:Width="140"/>
   <Column ss:Width="140"/>
   <Column ss:Width="120"/>
   <Column ss:Width="120"/>
   <Row ss:Height="26">
    <Cell ss:StyleID="Title"><Data ss:Type="String">BudgetBuddy Transaction Ledger Statement</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Filter Scope:</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(filterLabel)}</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Total Transactions:</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="Number">${totalCount}</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Total Inflow:</Data></Cell>
    <Cell ss:StyleID="Amount"><Data ss:Type="Number">${totalIn}</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Total Outflow:</Data></Cell>
    <Cell ss:StyleID="Amount"><Data ss:Type="Number">${totalOut}</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Net Cash Balance:</Data></Cell>
    <Cell ss:StyleID="Amount"><Data ss:Type="Number">${netBalance}</Data></Cell>
   </Row>
   <Row></Row>
   <Row ss:Height="24">
    <Cell ss:StyleID="Header"><Data ss:Type="String">Transaction ID</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Date</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Type</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Description</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Category / Source</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Account / Bank</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Payment Method</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Amount (${escapeXml(user.currency)})</Data></Cell>
   </Row>
   ${txRows}
  </Table>
 </Worksheet>
</Workbook>`;

  downloadExcelFile(`BudgetBuddy_Transactions_Ledger_${new Date().toISOString().split('T')[0]}.xls`, xml);
}

/**
 * Download a dedicated, up-to-date Excel report for Budgets
 */
export function exportBudgetsExcelReport(
  budgets: BudgetLimit[],
  expenses: ExpenseItem[],
  user: UserProfile,
  monthYear: string = 'Current'
) {
  const totalLimit = budgets.reduce((s, b) => s + b.monthlyLimit, 0);

  const budgetRows = budgets
    .map((b) => {
      const spent = expenses
        .filter((e) => e.category === b.category)
        .reduce((s, e) => s + e.amount, 0);
      const remaining = Math.max(0, b.monthlyLimit - spent);
      const pct = b.monthlyLimit > 0 ? Math.round((spent / b.monthlyLimit) * 100) : 0;
      const status = pct >= 100 ? 'EXCEEDED' : pct >= 90 ? 'ALMOST EXCEEDED' : pct >= 70 ? 'WARNING' : 'HEALTHY';

      return `
   <Row>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(b.category)}</Data></Cell>
    <Cell ss:StyleID="Amount"><Data ss:Type="Number">${b.monthlyLimit}</Data></Cell>
    <Cell ss:StyleID="Amount"><Data ss:Type="Number">${spent}</Data></Cell>
    <Cell ss:StyleID="Amount"><Data ss:Type="Number">${remaining}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${pct}%</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${status}</Data></Cell>
   </Row>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#1E293B"/>
  </Style>
  <Style ss:ID="Title">
   <Font ss:FontName="Calibri" ss:Size="16" ss:Bold="1" ss:Color="#4338CA"/>
  </Style>
  <Style ss:ID="Header">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#4338CA" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="Value">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#0F172A"/>
  </Style>
  <Style ss:ID="Amount">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#0F172A"/>
   <NumberFormat ss:Format="#,##0.00"/>
  </Style>
 </Styles>

 <Worksheet ss:Name="Budget Planning">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="160"/>
   <Column ss:Width="120"/>
   <Column ss:Width="120"/>
   <Column ss:Width="120"/>
   <Column ss:Width="90"/>
   <Column ss:Width="140"/>
   <Row ss:Height="26">
    <Cell ss:StyleID="Title"><Data ss:Type="String">BudgetBuddy Monthly Budget Plan Report</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Budget Month:</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(monthYear)}</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Total Monthly Budget Cap:</Data></Cell>
    <Cell ss:StyleID="Amount"><Data ss:Type="Number">${totalLimit}</Data></Cell>
   </Row>
   <Row></Row>
   <Row ss:Height="24">
    <Cell ss:StyleID="Header"><Data ss:Type="String">Category</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Budget Limit (${escapeXml(user.currency)})</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Spent Amount</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Remaining Gap</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Usage %</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Health Status</Data></Cell>
   </Row>
   ${budgetRows}
  </Table>
 </Worksheet>
</Workbook>`;

  downloadExcelFile(`BudgetBuddy_Budget_Report_${new Date().toISOString().split('T')[0]}.xls`, xml);
}

/**
 * Download a dedicated, up-to-date Excel report for Savings Goals
 */
export function exportSavingsGoalsExcelReport(
  goals: SavingsGoal[],
  user: UserProfile,
  filterLabel: string = 'All Goals'
) {
  const totalTarget = goals.reduce((s, g) => s + (g.targetAmount || 0), 0);
  const totalSaved = goals.reduce((s, g) => s + (g.currentAmount || 0), 0);
  const totalRemaining = Math.max(0, totalTarget - totalSaved);

  const goalRows = goals
    .map((g) => {
      const target = g.targetAmount || 1;
      const saved = g.currentAmount || 0;
      const rem = Math.max(0, target - saved);
      const pct = Math.min(100, Math.round((saved / target) * 100));

      return `
   <Row>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(g.title || g.name)}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(g.category)}</Data></Cell>
    <Cell ss:StyleID="Amount"><Data ss:Type="Number">${target}</Data></Cell>
    <Cell ss:StyleID="Amount"><Data ss:Type="Number">${saved}</Data></Cell>
    <Cell ss:StyleID="Amount"><Data ss:Type="Number">${rem}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${pct}%</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(g.targetDate)}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${pct >= 100 ? 'COMPLETED' : 'IN PROGRESS'}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(g.priority || 'Medium')}</Data></Cell>
   </Row>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#1E293B"/>
  </Style>
  <Style ss:ID="Title">
   <Font ss:FontName="Calibri" ss:Size="16" ss:Bold="1" ss:Color="#047857"/>
  </Style>
  <Style ss:ID="Header">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#047857" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="Value">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#0F172A"/>
  </Style>
  <Style ss:ID="Amount">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#047857"/>
   <NumberFormat ss:Format="#,##0.00"/>
  </Style>
 </Styles>

 <Worksheet ss:Name="Savings Goals">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="160"/>
   <Column ss:Width="120"/>
   <Column ss:Width="120"/>
   <Column ss:Width="120"/>
   <Column ss:Width="120"/>
   <Column ss:Width="80"/>
   <Column ss:Width="110"/>
   <Column ss:Width="110"/>
   <Column ss:Width="90"/>
   <Row ss:Height="26">
    <Cell ss:StyleID="Title"><Data ss:Type="String">BudgetBuddy Savings Goals Report</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Filter Scope:</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(filterLabel)}</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Total Target Capital:</Data></Cell>
    <Cell ss:StyleID="Amount"><Data ss:Type="Number">${totalTarget}</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Total Amount Saved:</Data></Cell>
    <Cell ss:StyleID="Amount"><Data ss:Type="Number">${totalSaved}</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Net Remaining to Goal:</Data></Cell>
    <Cell ss:StyleID="Amount"><Data ss:Type="Number">${totalRemaining}</Data></Cell>
   </Row>
   <Row></Row>
   <Row ss:Height="24">
    <Cell ss:StyleID="Header"><Data ss:Type="String">Goal Title</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Category</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Target Amount (${escapeXml(user.currency)})</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Saved Amount</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Remaining</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Progress %</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Target Date</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Status</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Priority</Data></Cell>
   </Row>
   ${goalRows}
  </Table>
 </Worksheet>
</Workbook>`;

  downloadExcelFile(`BudgetBuddy_Savings_Goals_Report_${new Date().toISOString().split('T')[0]}.xls`, xml);
}

/**
 * Download a dedicated, up-to-date Excel report for Accounts & Banks
 */
export function exportAccountsExcelReport(
  accounts: FinancialAccount[],
  user: UserProfile
) {
  const totalBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0);

  const accRows = accounts
    .map(
      (a) => `
   <Row>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(a.name)}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(a.bankName)}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(a.accountType)}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">•••• ${escapeXml(a.lastFourDigits)}</Data></Cell>
    <Cell ss:StyleID="Amount"><Data ss:Type="Number">${a.balance}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(a.notes || '')}</Data></Cell>
   </Row>`
    )
    .join('\n');

  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#1E293B"/>
  </Style>
  <Style ss:ID="Title">
   <Font ss:FontName="Calibri" ss:Size="16" ss:Bold="1" ss:Color="#2563EB"/>
  </Style>
  <Style ss:ID="Header">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#2563EB" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="Value">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#0F172A"/>
  </Style>
  <Style ss:ID="Amount">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#2563EB"/>
   <NumberFormat ss:Format="#,##0.00"/>
  </Style>
 </Styles>

 <Worksheet ss:Name="Accounts &amp; Banks">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="160"/>
   <Column ss:Width="140"/>
   <Column ss:Width="110"/>
   <Column ss:Width="110"/>
   <Column ss:Width="140"/>
   <Column ss:Width="200"/>
   <Row ss:Height="26">
    <Cell ss:StyleID="Title"><Data ss:Type="String">BudgetBuddy Banking &amp; Accounts Ledger</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Total Active Accounts:</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="Number">${accounts.length}</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Total Liquid Net Worth:</Data></Cell>
    <Cell ss:StyleID="Amount"><Data ss:Type="Number">${totalBalance}</Data></Cell>
   </Row>
   <Row></Row>
   <Row ss:Height="24">
    <Cell ss:StyleID="Header"><Data ss:Type="String">Account Name</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Institution / Bank</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Account Type</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Account Number</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Available Balance (${escapeXml(user.currency)})</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Notes</Data></Cell>
   </Row>
   ${accRows}
  </Table>
 </Worksheet>
</Workbook>`;

  downloadExcelFile(`BudgetBuddy_Accounts_Report_${new Date().toISOString().split('T')[0]}.xls`, xml);
}

/**
 * Download a dedicated, up-to-date Excel report for Cards & Vault
 */
export function exportCardsExcelReport(
  cards: PaymentCard[],
  user: UserProfile
) {
  const totalCreditLimit = cards.filter((c) => c.cardType === 'credit').reduce((s, c) => s + (c.creditLimit || 0), 0);
  const totalDue = cards.filter((c) => c.cardType === 'credit').reduce((s, c) => s + (c.balanceOrDue || 0), 0);

  const cardRows = cards
    .map(
      (c) => `
   <Row>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(c.cardName)}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(c.bankName)}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(c.cardType.toUpperCase())}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">•••• ${escapeXml(c.last4)}</Data></Cell>
    <Cell ss:StyleID="Amount"><Data ss:Type="Number">${c.balanceOrDue || 0}</Data></Cell>
    <Cell ss:StyleID="Amount"><Data ss:Type="Number">${c.creditLimit || 0}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(c.expiryMonthYear)}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${c.isFrozen ? 'LOCKED / FROZEN' : 'ACTIVE'}</Data></Cell>
   </Row>`
    )
    .join('\n');

  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#1E293B"/>
  </Style>
  <Style ss:ID="Title">
   <Font ss:FontName="Calibri" ss:Size="16" ss:Bold="1" ss:Color="#7C3AED"/>
  </Style>
  <Style ss:ID="Header">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#7C3AED" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="Value">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#0F172A"/>
  </Style>
  <Style ss:ID="Amount">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#7C3AED"/>
   <NumberFormat ss:Format="#,##0.00"/>
  </Style>
 </Styles>

 <Worksheet ss:Name="Cards &amp; Vault">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="160"/>
   <Column ss:Width="140"/>
   <Column ss:Width="90"/>
   <Column ss:Width="100"/>
   <Column ss:Width="120"/>
   <Column ss:Width="120"/>
   <Column ss:Width="90"/>
   <Column ss:Width="110"/>
   <Row ss:Height="26">
    <Cell ss:StyleID="Title"><Data ss:Type="String">BudgetBuddy Cards &amp; Vault Report</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Total Cards in Vault:</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="Number">${cards.length}</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Total Credit Limit:</Data></Cell>
    <Cell ss:StyleID="Amount"><Data ss:Type="Number">${totalCreditLimit}</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Total Outstanding Due:</Data></Cell>
    <Cell ss:StyleID="Amount"><Data ss:Type="Number">${totalDue}</Data></Cell>
   </Row>
   <Row></Row>
   <Row ss:Height="24">
    <Cell ss:StyleID="Header"><Data ss:Type="String">Card Name</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Issuer Bank</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Card Type</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Last 4</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Balance / Due (${escapeXml(user.currency)})</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Credit Limit</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Expiry</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Status</Data></Cell>
   </Row>
   ${cardRows}
  </Table>
 </Worksheet>
</Workbook>`;

  downloadExcelFile(`BudgetBuddy_Cards_Vault_Report_${new Date().toISOString().split('T')[0]}.xls`, xml);
}

/**
 * Download a dedicated, up-to-date Excel report for P2P Transfers
 */
export function exportTransfersExcelReport(
  transfers: PersonTransfer[],
  user: UserProfile,
  filterLabel: string = 'All Transfers'
) {
  const totalSent = transfers
    .filter((t) => t.type === 'sent' || t.type === 'charged')
    .reduce((s, t) => s + (t.amount || 0), 0);
  const totalReceived = transfers
    .filter((t) => t.type === 'received' || t.type === 'split')
    .reduce((s, t) => s + (t.amount || 0), 0);
  const netTransferBalance = totalReceived - totalSent;

  const transferRows = transfers
    .map(
      (t) => `
   <Row>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(t.id)}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(t.date)}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(t.personName)}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(t.type.toUpperCase())}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(t.category)}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(t.paymentMode)}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(t.status.toUpperCase())}</Data></Cell>
    <Cell ss:StyleID="Amount"><Data ss:Type="Number">${t.amount}</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(t.referenceNote || '')}</Data></Cell>
   </Row>`
    )
    .join('\n');

  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#1E293B"/>
  </Style>
  <Style ss:ID="Title">
   <Font ss:FontName="Calibri" ss:Size="16" ss:Bold="1" ss:Color="#D97706"/>
  </Style>
  <Style ss:ID="Header">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#D97706" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="Value">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#0F172A"/>
  </Style>
  <Style ss:ID="Amount">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#D97706"/>
   <NumberFormat ss:Format="#,##0.00"/>
  </Style>
 </Styles>

 <Worksheet ss:Name="P2P Transfers">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="110"/>
   <Column ss:Width="90"/>
   <Column ss:Width="150"/>
   <Column ss:Width="90"/>
   <Column ss:Width="110"/>
   <Column ss:Width="110"/>
   <Column ss:Width="90"/>
   <Column ss:Width="110"/>
   <Column ss:Width="200"/>
   <Row ss:Height="26">
    <Cell ss:StyleID="Title"><Data ss:Type="String">BudgetBuddy P2P Transfers &amp; Split Ledger</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Filter Scope:</Data></Cell>
    <Cell ss:StyleID="Value"><Data ss:Type="String">${escapeXml(filterLabel)}</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Total Sent Out:</Data></Cell>
    <Cell ss:StyleID="Amount"><Data ss:Type="Number">${totalSent}</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Total Received:</Data></Cell>
    <Cell ss:StyleID="Amount"><Data ss:Type="Number">${totalReceived}</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Net P2P Position:</Data></Cell>
    <Cell ss:StyleID="Amount"><Data ss:Type="Number">${netTransferBalance}</Data></Cell>
   </Row>
   <Row></Row>
   <Row ss:Height="24">
    <Cell ss:StyleID="Header"><Data ss:Type="String">Transfer ID</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Date</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Person / Counterparty</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Transfer Type</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Category</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Payment Mode</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Status</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Amount (${escapeXml(user.currency)})</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Reference Note</Data></Cell>
   </Row>
   ${transferRows}
  </Table>
 </Worksheet>
</Workbook>`;

  downloadExcelFile(`BudgetBuddy_P2P_Transfers_Report_${new Date().toISOString().split('T')[0]}.xls`, xml);
}
