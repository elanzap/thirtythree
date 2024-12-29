import jsPDF from 'jspdf';
import type { LabInvoice } from '../../types';
import { getGlobalSettings } from '../../stores/globalSettingsStore';

export const generateLabInvoicePDF = async (
  invoice: LabInvoice, 
  diagnosticTests: Array<{name: string, price: number}>, 
  returnBlob: boolean = false
): Promise<{ blob: Blob; url: string } | void> => {
  if (!invoice) {
    console.error('No invoice provided');
    throw new Error('No invoice provided');
  }

  if (!diagnosticTests || diagnosticTests.length === 0) {
    console.error('No diagnostic tests provided');
    throw new Error('No diagnostic tests provided');
  }

  const doc = new jsPDF();
  const globalSettings = getGlobalSettings();

  // Set document properties
  doc.setFontSize(12);

  // Background color for header
  doc.setFillColor(240, 240, 240); // Light gray
  doc.rect(0, 0, 210, 50, 'F');

  // Header
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0); // Black
  doc.setFont('helvetica', 'bold');
  doc.text(globalSettings.labName || 'Medical Laboratory', 105, 25, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50); // Dark gray
  doc.text(globalSettings.labAddress || 'Address Not Available', 105, 35, { align: 'center' });
  doc.text(`Phone: ${globalSettings.labPhone || 'N/A'}`, 105, 42, { align: 'center' });

  // Invoice Details with subtle border
  doc.setDrawColor(200, 200, 200); // Light border color
  doc.setLineWidth(0.5);
  doc.line(15, 55, 195, 55);

  doc.setTextColor(0, 0, 0); // Black
  doc.setFontSize(10);
  doc.text(`Invoice No: ${invoice.id}`, 15, 65);
  doc.text(`Date: ${new Date(invoice.date).toLocaleDateString()}`, 150, 65, { align: 'right' });

  // Patient Details with background
  doc.setFillColor(250, 250, 250); // Very light gray
  doc.rect(15, 75, 180, 25, 'F');
  
  doc.setTextColor(0, 0, 0); // Black
  doc.setFont('helvetica', 'bold');
  doc.text('Patient Details', 20, 85);
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${invoice.patientName}`, 20, 92);
  doc.text(`Prescription ID: ${invoice.prescriptionId || 'N/A'}`, 150, 92, { align: 'right' });

  // Tests Details with alternating row colors
  doc.setFont('helvetica', 'bold');
  doc.text('Tests', 15, 110);

  let yPos = 120;
  invoice.tests.forEach((test, index) => {
    const testDetails = diagnosticTests.find(t => t.name === test);
    const price = testDetails?.price || 0;
    
    // Alternate background colors
    doc.setFillColor(index % 2 === 0 ? 245 : 255, 245, 245);
    doc.rect(15, yPos - 5, 180, 7, 'F');
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(`${index + 1}. ${test}`, 20, yPos);
    doc.text(`₹${price.toFixed(2)}`, 190, yPos, { align: 'right' });
    yPos += 7;
  });

  // Totals section with border
  doc.setDrawColor(200, 200, 200);
  doc.line(15, yPos + 5, 195, yPos + 5);
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  
  doc.text('Subtotal:', 20, yPos + 15);
  doc.text(`₹${invoice.subtotal.toFixed(2)}`, 190, yPos + 15, { align: 'right' });

  doc.text('Discount:', 20, yPos + 22);
  doc.text(`${invoice.discount}%`, 190, yPos + 22, { align: 'right' });

  doc.text('Total:', 20, yPos + 29, { style: 'bold' });
  doc.setTextColor(0, 100, 0); // Dark green for total
  doc.text(`₹${invoice.total.toFixed(2)}`, 190, yPos + 29, { align: 'right' });

  // Footer with watermark
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for your business!', 105, 280, { align: 'center' });
  doc.text('Powered by MedThirthy', 105, 285, { align: 'center' });

  // Watermark
  doc.setTextColor(230, 230, 230);
  doc.setFontSize(50);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', 105, 160, { align: 'center', angle: 45, opacity: 0.1 });

  if (returnBlob) {
    const blob = new Blob([doc.output('blob')], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    return { blob, url };
  } else {
    try {
      const pdfDataUri = doc.output('datauristring');
      
      // Create a temporary iframe in the current window
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.top = '0';
      iframe.style.left = '0';
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.backgroundColor = 'rgba(0,0,0,0.8)';
      iframe.style.zIndex = '9999';
      iframe.style.border = 'none';
      
      // Add close button
      const closeButton = document.createElement('button');
      closeButton.innerHTML = '×';
      closeButton.style.position = 'fixed';
      closeButton.style.right = '20px';
      closeButton.style.top = '20px';
      closeButton.style.zIndex = '10000';
      closeButton.style.backgroundColor = '#fff';
      closeButton.style.border = 'none';
      closeButton.style.borderRadius = '50%';
      closeButton.style.width = '40px';
      closeButton.style.height = '40px';
      closeButton.style.fontSize = '24px';
      closeButton.style.cursor = 'pointer';
      closeButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
      
      closeButton.onclick = () => {
        document.body.removeChild(iframe);
        document.body.removeChild(closeButton);
        document.body.style.overflow = 'auto';
      };
      
      // Set iframe content
      iframe.src = pdfDataUri;
      
      // Prevent body scrolling when PDF is open
      document.body.style.overflow = 'hidden';
      
      // Add elements to page
      document.body.appendChild(iframe);
      document.body.appendChild(closeButton);
    } catch (error) {
      console.error('Error displaying PDF:', error);
      throw error;
    }
  }
};