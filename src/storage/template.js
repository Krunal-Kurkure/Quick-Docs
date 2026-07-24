export const getBlankCoverLetterHtml = () => {
  // Formats the date nicely (e.g., "July 23, 2026")
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
    <div style="margin-bottom: 20px; border-bottom: 1px solid #e5e7eb; padding-bottom: 16px;">
      <p style="font-size: 20px; font-weight: 700; color: #111827; margin-bottom: 4px;">[Your Full Name]</p>
      <p style="color: #4b5563; font-size: 13px; margin-bottom: 4px;">
        [City, State Zip] | [Your Phone Number] | [Your Email Address] | [LinkedIn Profile name / Portfolio Website name ]
      </p>
    </div>

    <div style="margin-bottom: 24px;">
      <p>${currentDate}</p>
    </div>

    <div style="margin-bottom: 24px;">
      <p><strong>[Hiring Manager's Name or "Hiring Manager"]</strong></p>
      <p>[Hiring Manager's Title]</p>
      <p>[Company Name]</p>
      <p>[Company Address or City, State]</p>
    </div>

    <div style="line-height: 1.6;">
      <p>Dear [Hiring Manager's Name or "Hiring Team"],</p>

      <p style="margin-bottom: 16px;">
        I am writing to express my strong interest in the <strong>[Job Title]</strong> position at <strong>[Company Name]</strong>. With a solid foundation in [mention 1-2 key skills or your industry field], I am eager to contribute my expertise to your team and support your continued success.
      </p>

      <p style="margin-bottom: 16px;">
        In my previous role at [Previous Company Name], I successfully [mention a significant achievement, e.g., increased sales by 20%, streamlined a workflow, or delivered a major project]. This experience honed my abilities in [Skill 1], [Skill 2], and [Skill 3]. I am particularly drawn to <strong>[Company Name]</strong> because of [mention something you admire about the company's work, values, or culture], and I am confident that my proactive approach makes me a strong fit for this role.
      </p>

      <p style="margin-bottom: 24px;">
        Thank you for your time and consideration. I have attached my resume, which provides further details regarding my background and accomplishments. I welcome the opportunity to discuss how my skills align with the needs of your team.
      </p>
    </div>

    <div>
      <p style="margin-bottom: 32px;">Sincerely,</p>
      <p><strong>[Your Full Name]</strong></p>
    </div>
  `;
};