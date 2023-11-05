const Imap = require('imap');
const simpleParser = require('mailparser').simpleParser;
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

let imap = new Imap({
  user: 'timmy.moreels@gmail.com',
  password: 'wgpt ungg iake tqbf',
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false },
  connTimeout: 10000
});

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'timmy.moreels@gmail.com',
    pass: 'wgpt ungg iake tqbf'
  }
});

function openInbox(cb) {
  imap.openBox('INBOX', false, cb);
}

imap.once('ready', function() {
  openInbox(function(err, box) {
    if (err) throw err;
    imap.search(['UNSEEN', ['FROM', 'dysishomer@gmail.com']], function(err, results) {
      if (err) throw err;
      if (results.length === 0) {
        console.log('No new emails to fetch');
        return;
      }
      let f = imap.fetch(results, { bodies: '', markSeen: true });
      f.on('message', function(msg, seqno) {
        let rawEmail = '';
        msg.on('body', function(stream, info) {
          stream.on('data', function(chunk) {
            rawEmail += chunk.toString('utf8');
          });
          stream.once('end', function() {
            simpleParser(rawEmail, (err, mail) => {
              if (err) throw err;
              if (mail.attachments) {
                mail.attachments.forEach(function(attachment) {
                  if (attachment.contentType === 'application/pdf') {
                    console.log('PDF found in the email'); // Debugging line
                    let mailOptions = {
                      from: 'timmy.moreels@gmail.com',
                      to: 'dysiscypher@gmail.com',
                      subject: 'Extracted PDF',
                      text: '',
                      attachments: [
                        {
                          filename: attachment.filename,
                          content: attachment.content
                        }
                      ]
                    };
                    transporter.sendMail(mailOptions, function(error, info) {
                      if (error) {
                        console.log(error);
                      } else {
                        console.log('Email sent: ' + info.response);
                        console.log('PDF attached without saving to the file system'); // Debugging line
                      }
                    });
                  }
                });
              }
            });
          });
        });
      });
      f.once('end', function() {
        imap.end();
      });
    });
  });
});

imap.once('error', function(err) {
  console.log(err);
});

imap.once('end', function() {
  console.log('Connection ended');
});

imap.connect();

