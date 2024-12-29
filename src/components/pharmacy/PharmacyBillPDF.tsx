import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer } from '@react-pdf/renderer';
import { PharmacyBill } from '../../types/pharmacy';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
  },
  header: {
    marginBottom: 20,
    borderBottom: 1,
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: 100,
    fontSize: 10,
  },
  value: {
    flex: 1,
    fontSize: 10,
  },
  table: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 5,
    marginBottom: 5,
    backgroundColor: '#f3f4f6',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#666',
    paddingVertical: 5,
  },
  col1: { width: '25%', fontSize: 10 },
  col2: { width: '15%', fontSize: 10 },
  col3: { width: '15%', fontSize: 10 },
  col4: { width: '15%', fontSize: 10, textAlign: 'right' },
  col5: { width: '15%', fontSize: 10, textAlign: 'right' },
  col6: { width: '15%', fontSize: 10, textAlign: 'right' },
  summary: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#000',
    paddingTop: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 5,
  },
  summaryLabel: {
    width: 100,
    textAlign: 'right',
    paddingRight: 10,
    fontSize: 10,
  },
  summaryValue: {
    width: 100,
    textAlign: 'right',
    fontSize: 10,
  },
  total: {
    fontWeight: 'bold',
  },
});

interface PharmacyBillPDFProps {
  bill: PharmacyBill;
}

export const PharmacyBillPDF: React.FC<PharmacyBillPDFProps> = ({ bill }) => {
  return (
    <PDFViewer style={{ width: '100%', height: '100%' }}>
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>Pharmacy Bill</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Patient Name:</Text>
              <Text style={styles.value}>{bill.patientName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Prescription ID:</Text>
              <Text style={styles.value}>{bill.prescriptionId}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Date:</Text>
              <Text style={styles.value}>{new Date().toLocaleDateString()}</Text>
            </View>
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>Medicine</Text>
              <Text style={styles.col2}>Batch</Text>
              <Text style={styles.col3}>Expiry</Text>
              <Text style={styles.col4}>Qty</Text>
              <Text style={styles.col5}>Price</Text>
              <Text style={styles.col6}>Amount</Text>
            </View>

            {bill.items.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.col1}>{item.medicineName}</Text>
                <Text style={styles.col2}>{item.batchNo}</Text>
                <Text style={styles.col3}>{item.expiryDate}</Text>
                <Text style={styles.col4}>{item.quantity}</Text>
                <Text style={styles.col5}>₹{(item.amount / item.quantity).toFixed(2)}</Text>
                <Text style={styles.col6}>₹{item.amount.toFixed(2)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryValue}>₹{bill.subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount:</Text>
              <Text style={styles.summaryValue}>{bill.discount}%</Text>
            </View>
            <View style={[styles.summaryRow, styles.total]}>
              <Text style={styles.summaryLabel}>Total:</Text>
              <Text style={styles.summaryValue}>₹{bill.total.toFixed(2)}</Text>
            </View>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};

export default PharmacyBillPDF;
