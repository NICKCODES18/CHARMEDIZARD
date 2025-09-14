import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function notifyDoctor(report: any) {
  if (!process.env.DOCTOR_EMAIL) {
    console.warn("No DOCTOR_EMAIL configured, skipping notification");
    return;
  }

  const msg = {
    to: process.env.DOCTOR_EMAIL,
    from: process.env.SENDGRID_FROM!, 
    subject: `New Triage Report - Urgency: ${report.urgency.toUpperCase()}`,
    text: `
A new triage report has been generated.

Patient ID: ${report.patientId}
Urgency: ${report.urgency}
Recommended Action: ${report.recommendedAction}

Doctor Summary:
${report.summaryForDoctor}

Full JSON attached.
`,
    html: `
      <h2>New Triage Report</h2>
      <p><b>Patient ID:</b> ${report.patientId}</p>
      <p><b>Urgency:</b> ${report.urgency}</p>
      <p><b>Recommended Action:</b> ${report.recommendedAction}</p>
      <p><b>Doctor Summary:</b> ${report.summaryForDoctor}</p>
      <pre style="background:#f4f4f4; padding:10px; border-radius:6px; white-space:pre-wrap;">${JSON.stringify(
        report,
        null,
        2
      )}</pre>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log("Notification sent to doctor");
  } catch (error: any) {
    console.error("Failed to send email", error.response?.body || error.message);
  }
}
