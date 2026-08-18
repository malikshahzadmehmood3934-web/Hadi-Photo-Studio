import { jsPDF } from 'jspdf';
import { EventDuty, StaffMember, StudioSettings } from '../types';

export function generateDutyLetterPDF(
  events: EventDuty[],
  staffMembers: StaffMember[],
  settings: StudioSettings,
  title = 'OFFICIAL DUTY CONFIRMATION LETTER'
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header background banner
  doc.setFillColor(15, 23, 42); // dark navy
  doc.rect(0, 0, pageWidth, 35, 'F');

  // Studio Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(settings.name || 'HADI PHOTO STUDIO', 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Contact: ${settings.contact || '0305-8304908'} | Email: info@hadiphotostudio.com`, 14, 26);
  if (settings.address) {
    doc.text(`Address: ${settings.address}`, 14, 31);
  }

  // Document Title & Date
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(title, 14, 48);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 14, 54);

  // Divider line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 58, pageWidth - 14, 58);

  let startY = 66;

  if (events.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(11);
    doc.text('No confirmed duty assignments found for the selected criteria.', 14, startY);
  } else {
    // Duty Table Headers
    const colX = {
      staff: 14,
      event: 55,
      dateShift: 95,
      venue: 135,
      pay: 175
    };

    doc.setFillColor(241, 245, 249);
    doc.rect(14, startY, pageWidth - 28, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);

    doc.text('STAFF NAME', colX.staff + 2, startY + 5.5);
    doc.text('EVENT & ROLE', colX.event, startY + 5.5);
    doc.text('DATE & SHIFT', colX.dateShift, startY + 5.5);
    doc.text('VENUE & CITY', colX.venue, startY + 5.5);
    doc.text('PAY (ADV)', colX.pay, startY + 5.5);

    startY += 12;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);

    events.forEach((evt, idx) => {
      const staff = staffMembers.find(s => s.id === evt.staffId);
      const staffName = staff ? staff.name : 'Unassigned';
      const eventRole = `${evt.type}${evt.role ? ` (${evt.role})` : ''}`;
      const dateShift = `${evt.date} [${evt.shift}]`;
      const venueCity = `${evt.locName}${evt.city ? `, ${evt.city}` : ''}`;
      const payAdv = `${settings.currency || 'Rs.'}${evt.payment} (Adv:${evt.advance})`;

      // Alternate row bg
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, startY - 4, pageWidth - 28, 9, 'F');
      }

      doc.text(staffName.substring(0, 20), colX.staff + 2, startY);
      doc.text(eventRole.substring(0, 22), colX.event, startY);
      doc.text(dateShift, colX.dateShift, startY);
      doc.text(venueCity.substring(0, 22), colX.venue, startY);
      doc.text(payAdv, colX.pay, startY);

      startY += 9;

      // New page check
      if (startY > 250) {
        doc.addPage();
        startY = 20;
      }
    });
  }

  // Terms & Conditions Block
  startY += 8;
  if (startY > 220) {
    doc.addPage();
    startY = 20;
  }

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, startY, pageWidth - 28, 38, 'DF');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('STUDIO TERMS & DUTY INSTRUCTIONS:', 18, startY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  const lines = settings.terms
    ? settings.terms.split('\n').slice(0, 4)
    : ['Check-in via app is required on venue arrival.', 'Handle camera equipment with utmost care.'];
  
  lines.forEach((line, index) => {
    doc.text(`• ${line}`, 18, startY + 12 + (index * 5));
  });

  // Signature Block at bottom
  const sigY = 265;
  doc.setLineWidth(0.3);
  doc.setDrawColor(148, 163, 184);

  // Admin Signature Line
  doc.line(20, sigY, 75, sigY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text('Studio Management Signature', 20, sigY + 5);

  // Staff Stamp Line
  doc.line(pageWidth - 75, sigY, pageWidth - 20, sigY);
  doc.text('Official Hadi Studio Seal & Date', pageWidth - 75, sigY + 5);

  // Trigger Save
  doc.save(`Hadi_Studio_Duty_Letter_${new Date().toISOString().slice(0, 10)}.pdf`);
}
