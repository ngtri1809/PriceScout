import nodemailer from 'nodemailer';
import AWS from 'aws-sdk';
import { config } from '../../config/index.js';
import { logger } from '../../lib/logger.js';

export class EmailService {
  constructor() {
    if (config.nodeEnv === 'production') {
      this.setupSES();
    } else {
      this.setupMailHog();
    }
  }

  setupSES() {
    const ses = new AWS.SES({
      region: config.email.ses.region,
      accessKeyId: config.email.ses.accessKey,
      secretAccessKey: config.email.ses.secretKey,
    });

    this.transporter = nodemailer.createTransporter({
      SES: { ses, aws: AWS },
    });

    logger.info('Email service initialized with AWS SES');
  }

  setupMailHog() {
    this.transporter = nodemailer.createTransporter({
      host: config.email.mailhog.host,
      port: config.email.mailhog.port,
      secure: false,
      auth: null,
    });

    logger.info('Email service initialized with MailHog');
  }

  async sendEmail(options) {
    try {
      const mailOptions = {
        from: config.nodeEnv === 'production' 
          ? 'noreply@pricescout.com' 
          : 'test@pricescout.local',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.htmlToText(options.html),
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${options.to}: ${result.messageId}`);
    } catch (error) {
      logger.error('Failed to send email:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendPriceDropNotification(userEmail, userName, itemName, currentPrice, previousPrice, itemUrl) {
    const priceDrop = previousPrice - currentPrice;
    const percentageDrop = Math.round((priceDrop / previousPrice) * 100);

    const subject = `💰 Price Drop Alert: ${itemName}`;
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Price Drop Alert</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .price-highlight { font-size: 24px; font-weight: bold; color: #4CAF50; }
            .button { display: inline-block; padding: 12px 24px; background: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Price Drop Alert!</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <p>Great news! The price for <strong>${itemName}</strong> has dropped!</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <div class="price-highlight">$${currentPrice.toFixed(2)}</div>
                <p>Previous price: <span style="text-decoration: line-through;">$${previousPrice.toFixed(2)}</span></p>
                <p>You save: <strong>$${priceDrop.toFixed(2)} (${percentageDrop}%)</strong></p>
              </div>
              
              <p>Don't miss out on this deal! Click the button below to view the item.</p>
              
              <div style="text-align: center;">
                <a href="${itemUrl}" class="button">View Item</a>
              </div>
              
              <p>Happy shopping!</p>
              <p>The PriceScout Team</p>
            </div>
            <div class="footer">
              <p>You received this email because you're watching this item on PriceScout.</p>
              <p>To unsubscribe from price alerts, visit your <a href="${process.env.WEB_URL || 'http://localhost:5173'}/watchlist">watchlist</a>.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: userEmail,
      subject,
      html,
    });
  }

  htmlToText(html) {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
  }
}

export const emailService = new EmailService();
