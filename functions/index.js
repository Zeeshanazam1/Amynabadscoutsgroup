const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');

admin.initializeApp();

const cfg = functions.config() || {};
const SENDGRID_API_KEY = (cfg.sendgrid && cfg.sendgrid.key) || process.env.SENDGRID_API_KEY;
const ADMIN_EMAIL = (cfg.admin && cfg.admin.email) || process.env.ADMIN_EMAIL || 'zeeshanazam11122@gmail.com';

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
} else {
  console.warn('SENDGRID_API_KEY not set — email notifications disabled');
}

exports.sendLeaveNotification = functions.firestore
  .document('leaveApplications/{docId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const subject = `Leave Application: ${data.requesterName || data.requesterEmail || 'Unknown'}`;
    const lines = [];
    lines.push(`Name: ${data.requesterName || ''}`);
    lines.push(`Email: ${data.requesterEmail || ''}`);
    lines.push(`Leave Type: ${data.leaveType || ''}`);
    lines.push(`Start Date: ${data.startDate || ''}`);
    lines.push(`End Date: ${data.endDate || ''}`);
    lines.push(`Reason:\n${data.reason || ''}`);
    lines.push(`Submitted at: ${new Date(data.createdAt || Date.now()).toISOString()}`);

    const text = lines.join('\n');

    if (!SENDGRID_API_KEY) {
      console.log('Would send email to', ADMIN_EMAIL, 'with subject', subject, 'and body:\n', text);
      return null;
    }

    const msg = {
      to: ADMIN_EMAIL,
      from: ADMIN_EMAIL,
      subject,
      text,
    };

    try {
      await sgMail.send(msg);
      console.log('Leave notification sent for', snap.id);
    } catch (err) {
      console.error('Error sending leave notification', err);
    }

    return null;
  });
