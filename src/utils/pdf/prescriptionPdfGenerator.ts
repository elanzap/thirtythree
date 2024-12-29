import jsPDF from 'jspdf';
import type { Prescription } from '../../types';
import { getGlobalSettings } from '../../stores/globalSettingsStore';

const formatPrescriptionDetails = (prescription: Partial<Prescription>) => {
  const globalSettings = getGlobalSettings();
  const doctor = {
    name: globalSettings.doctorName || 'Dr. Ram Kumar',
    qualifications: globalSettings.doctorQualifications || 'MBBS, MD, MPH (USA)',
    regNo: globalSettings.doctorRegNo || 'Regd No: 54371',
    specialization: globalSettings.doctorSpecialization || 'Physician & Consultant (General Medicine)'
  };

  const patientName = prescription.patientName || prescription.patient?.name || 'Unknown Patient';
  const patientGender = prescription.gender || prescription.patient?.gender || 'Not Specified';
  const patientAge = prescription.age || prescription.patient?.age?.toString() || 'Not Specified';
  const patientPhone = prescription.phone || prescription.patient?.phoneNumber || 'Not Provided';

  return {
    clinic: {
      name: globalSettings.clinicName || 'Suguna Clinic',
      address: globalSettings.clinicAddress || 'Vinayak Nagar, Hyderabad',
      location: globalSettings.clinicLocation || 'Hyderabad, Telangana',
      phone: globalSettings.clinicPhone || 'Ph: 9618994555',
      website: globalSettings.clinicWebsite || 'Website: sugunaclinic.com'
    },
    doctor,
    prescription: {
      id: prescription.prescriptionId || `OPD${Date.now()}`,
      date: new Date().toLocaleDateString(),
      visitId: prescription.visitId || `OCID${Date.now()}`,
      patientDetails: {
        name: patientName,
        gender: patientGender,
        age: patientAge,
        weight: prescription.vitalSigns?.weight || '',
        bp: prescription.vitalSigns?.bloodPressure || '',
        temperature: prescription.vitalSigns?.temperature ? `${prescription.vitalSigns.temperature} F` : '',
        phone: patientPhone,
        allergies: prescription.knownAllergies || ''
      },
      symptoms: prescription.symptoms || '',
      medications: prescription.medications || [],
      labTests: prescription.labTests || [],
      advice: prescription.advice || ''
    }
  };
};

export const generatePrescriptionPDF = async (
  prescription: Partial<Prescription>, 
  displayMode: 'blob' | 'inline' = 'blob'
): Promise<string | void> => {
  if (!prescription) {
    console.error('No prescription provided');
    throw new Error('No prescription provided');
  }

  const doc = new jsPDF();
  const details = formatPrescriptionDetails(prescription);
  
  const clinicLogo = getGlobalSettings().clinicLogo;
  if (clinicLogo) {
    try {
      doc.addImage(clinicLogo, 'PNG', 15, 10, 30, 30);
    } catch (error) {
      console.error('Error adding clinic logo:', error);
    }
  }

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(details.clinic.name, 50, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(details.clinic.address, 50, 25);
  doc.text(details.clinic.location, 50, 30);
  doc.text(details.clinic.phone, 50, 35);
  doc.text(details.clinic.website, 50, 40);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(details.doctor.name, 140, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(details.doctor.qualifications, 140, 25);
  doc.text(details.doctor.specialization, 140, 30);
  doc.text(details.doctor.regNo, 140, 35);

  doc.line(15, 45, 195, 45); 

  doc.setFontSize(10);
  doc.text(`Prescription ${details.prescription.id}`, 15, 55);
  doc.text(`Date : ${details.prescription.date}`, 140, 55);

  let y = 65;
  doc.text('OPD ID', 15, y);
  doc.text(': ' + details.prescription.id, 60, y);
  doc.text('OPD Visit ID', 110, y);
  doc.text(': ' + details.prescription.visitId, 160, y);

  y += 7;
  doc.text('Patient Name', 15, y);
  doc.text(': ' + details.prescription.patientDetails.name, 60, y);
  doc.text('Age', 110, y);
  doc.text(': ' + details.prescription.patientDetails.age + ' years', 160, y);

  y += 7;
  doc.text('Gender', 15, y);
  doc.text(': ' + details.prescription.patientDetails.gender, 60, y);
  doc.text('Phone', 110, y);
  doc.text(': ' + details.prescription.patientDetails.phone, 160, y);

  y += 7;
  doc.text('BP', 15, y);
  doc.text(': ' + details.prescription.patientDetails.bp, 60, y);
  doc.text('Temperature', 110, y);
  doc.text(': ' + details.prescription.patientDetails.temperature, 160, y);

  y += 7;
  doc.text('Weight', 15, y);
  doc.text(': ' + details.prescription.patientDetails.weight + ' kg', 60, y);
  doc.text('Allergies', 110, y);
  doc.text(': ' + details.prescription.patientDetails.allergies, 160, y);

  y += 7;
  doc.text('Consultant Doctor', 15, y);
  doc.text(': ' + details.doctor.name, 60, y);

  y += 15;
  doc.setFont('helvetica', 'bold');
  doc.text('Symptoms:', 15, y);
  doc.setFont('helvetica', 'normal');
  doc.text(details.prescription.symptoms, 25, y + 7);

  y += 25;
  doc.setFont('helvetica', 'bold');
  doc.text('Medicines', 15, y);

  y += 7;
  doc.setFontSize(9);
  doc.text('#', 15, y);
  doc.text('Category', 25, y);
  doc.text('Medicine', 45, y);
  doc.text('Dosage', 105, y);
  doc.text('Interval', 130, y);
  doc.text('Duration', 160, y);
  doc.text('Instruction', 185, y);

  doc.setFont('helvetica', 'normal');
  details.prescription.medications.forEach((med, index) => {
    y += 7;
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text((index + 1).toString(), 15, y);
    doc.text('Tab', 25, y);
    doc.text(med.name, 45, y);
    doc.text(med.dosage, 105, y);
    doc.text(med.interval, 130, y);
    doc.text(med.duration, 160, y);
    doc.text(med.instructions, 185, y);
  });

  if (details.prescription.labTests.length > 0) {
    y += 15;
    doc.setFont('helvetica', 'bold');
    doc.text('Pathology Test', 15, y);
    details.prescription.labTests.forEach((test, index) => {
      y += 7;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'normal');
      doc.text(`${index + 1}. ${test}`, 15, y);
    });
  }

  if (details.prescription.advice) {
    y += 15;
    doc.setFont('helvetica', 'normal');
    doc.text(details.prescription.advice, 15, y);
  }

  // Generate PDF based on display mode
  if (displayMode === 'blob') {
    const blob = doc.output('blob');
    return URL.createObjectURL(blob);
  } else {
    return new Promise<void>((resolve, reject) => {
      try {
        const pdfDataUri = doc.output('datauristring');
        
        // Create modal container
        const modalContainer = document.createElement('div');
        modalContainer.id = 'prescription-pdf-modal';
        modalContainer.innerHTML = `
          <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
          ">
            <div style="
              width: 80%;
              height: 90%;
              background-color: white;
              border-radius: 8px;
              position: relative;
              overflow: hidden;
            ">
              <button id="close-pdf-modal" style="
                position: absolute;
                top: 10px;
                right: 10px;
                background-color: #f44336;
                color: white;
                border: none;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                font-size: 24px;
                cursor: pointer;
                z-index: 10000;
              ">×</button>
              <iframe src="${pdfDataUri}" style="
                width: 100%;
                height: 100%;
                border: none;
              "></iframe>
            </div>
          </div>
        `;

        // Add to document
        document.body.appendChild(modalContainer);

        // Add close event listener
        const closeButton = document.getElementById('close-pdf-modal');
        if (closeButton) {
          closeButton.addEventListener('click', () => {
            document.body.removeChild(modalContainer);
          });
        }

        resolve();
      } catch (error) {
        console.error('Error creating PDF modal:', error);
        reject(error);
      }
    });
  }
};