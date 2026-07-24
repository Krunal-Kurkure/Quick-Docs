export const buildCoverLetterHtml = ({ bodyHtml = '' }) => {
  return `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>
        @page {
          margin: 40pt 40pt; /* Slightly larger margins for a professional document look */
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          font-size: 11pt; /* pt units are generally better for PDF scaling than px */
          line-height: 1.5;
          color: #111827;
          margin: 0;
          padding: 0;
        }
        .content {
          white-space: normal;
          word-break: break-word;
        }
        p {
          margin: 0 0 12px 0;
        }
        p:last-child {
          margin-bottom: 0;
        }
        b, strong {
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="content">${bodyHtml || ''}</div>
    </body>
  </html>
  `;
};