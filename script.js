// script.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('resumeForm');
  const resumeOutputEl = document.getElementById('resumeOutput');
  const downloadBtn = document.getElementById('downloadPdf');

  // initially hide/disable download button
  downloadBtn.style.display = 'none';
  downloadBtn.disabled = true;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // collect values
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const linkedin = document.getElementById('linkedin').value.trim();
    const github = document.getElementById('github').value.trim();
    const objective = document.getElementById('objective').value.trim();
    const school = document.getElementById('school').value.trim();
    const degree = document.getElementById('degree').value.trim();
    const graduation = document.getElementById('graduation').value.trim();
    const company = document.getElementById('company').value.trim();
    const role = document.getElementById('role').value.trim();
    const duration = document.getElementById('duration').value.trim();
    const description = document.getElementById('description').value.trim();
    const project1 = document.getElementById('project1').value.trim();
    const project1desc = document.getElementById('project1desc').value.trim();
    const project2 = document.getElementById('project2').value.trim();
    const project2desc = document.getElementById('project2desc').value.trim();
    const honors = document.getElementById('honors').value.trim();
    const hobbiesRaw = document.getElementById('hobbies').value;
    const skillsRaw = document.getElementById('skills').value;

    const hobbies = hobbiesRaw ? hobbiesRaw.split(',').map(h => h.trim()).filter(Boolean) : [];
    const skills = skillsRaw ? skillsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

    // build preview HTML (safe-ish: values are text inputs only)
    const resumeHTML = `
      <div class="resume-card">
        <h2 style="text-align:center; color:#007BFF; margin:0 0 8px 0;">${escapeHtml(name || 'Your Name')}</h2>
        <p style="margin:4px 0;"><strong>Email:</strong> ${escapeLink(email)}</p>
        <p style="margin:4px 0;"><strong>Phone:</strong> ${escapeHtml(phone)}</p>
        <p style="margin:4px 0;"><strong>Address:</strong> ${escapeHtml(address)}</p>
        <p style="margin:4px 0;"><strong>LinkedIn:</strong> ${linkOrText(linkedin)}</p>
        <p style="margin:4px 0;"><strong>GitHub:</strong> ${linkOrText(github)}</p>

        <h3 style="color:#007BFF; margin-top:16px;">Objective</h3>
        <p>${escapeHtml(objective)}</p>

        <h3 style="color:#007BFF; margin-top:12px;">Education</h3>
        <p><strong>${escapeHtml(degree)}</strong> from <strong>${escapeHtml(school)}</strong>, <em>${escapeHtml(graduation)}</em></p>

        <h3 style="color:#007BFF; margin-top:12px;">Experience</h3>
        <p><strong>${escapeHtml(role)}</strong> at <strong>${escapeHtml(company)}</strong>, <em>${escapeHtml(duration)}</em></p>
        <p>${escapeHtml(description)}</p>

        <h3 style="color:#007BFF; margin-top:12px;">Projects</h3>
        ${project1 ? `<p><strong>${escapeHtml(project1)}</strong><br>${escapeHtml(project1desc)}</p>` : ''}
        ${project2 ? `<p><strong>${escapeHtml(project2)}</strong><br>${escapeHtml(project2desc)}</p>` : ''}

        <h3 style="color:#007BFF; margin-top:12px;">Honors & Awards</h3>
        <p>${escapeHtml(honors)}</p>

        <h3 style="color:#007BFF; margin-top:12px;">Hobbies</h3>
        ${hobbies.length ? `<ul>${hobbies.map(h => `<li>${escapeHtml(h)}</li>`).join('')}</ul>` : '<p>-</p>'}

        <h3 style="color:#007BFF; margin-top:12px;">Skills</h3>
        ${skills.length ? `<ul>${skills.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ul>` : '<p>-</p>'}
      </div>
    `;

    resumeOutputEl.innerHTML = resumeHTML;
    resumeOutputEl.classList.add('fadeIn'); // optional CSS animation (add in your CSS)
    downloadBtn.style.display = 'inline-block';
    downloadBtn.disabled = false;
  });

  downloadBtn.addEventListener('click', function () {
    // Get jsPDF constructor safely
    const jsPDFConstructor = (window.jspdf && window.jspdf.jsPDF) ? window.jspdf.jsPDF : (window.jsPDF || null);
    if (!jsPDFConstructor) {
      alert('jsPDF library not found. Make sure you included the jsPDF script before script.js.');
      return;
    }

    const doc = new jsPDFConstructor('p', 'pt', 'a4');
    const margin = 40;
    let y = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const usableWidth = pageWidth - margin * 2;
    const lineHeight = 14;

    // small helper to add text with wrapping and page breaks
    function addWrappedText(text, opts = {}) {
      const size = opts.size || 12;
      doc.setFontSize(size);
      const lines = doc.splitTextToSize(text, usableWidth);
      lines.forEach(line => {
        if (y + lineHeight > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += lineHeight;
      });
    }

    // header (name centered)
    const name = (document.getElementById('name').value || '').trim();
    if (name) {
      doc.setFontSize(20);
      doc.setTextColor('#007BFF');
      // center the name
      const nameWidth = doc.getTextWidth(name);
      doc.text(name, (pageWidth - nameWidth) / 2, y);
      y += 28;
    }

    // contact details
    doc.setFontSize(11);
    doc.setTextColor('#000000');
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const linkedin = document.getElementById('linkedin').value.trim();
    const github = document.getElementById('github').value.trim();

    addWrappedText(`Email: ${email}`, { size: 11 });
    addWrappedText(`Phone: ${phone}`, { size: 11 });
    addWrappedText(`Address: ${address}`, { size: 11 });
    if (linkedin) addWrappedText(`LinkedIn: ${linkedin}`, { size: 11 });
    if (github) addWrappedText(`GitHub: ${github}`, { size: 11 });

    y += 6;

    // sections helper
    function addSectionTitle(title) {
      if (y + 24 > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
      doc.setFontSize(14);
      doc.setTextColor('#007BFF');
      doc.text(title, margin, y);
      y += 18;
      doc.setFontSize(12);
      doc.setTextColor('#000000');
    }

    // objective
    const objective = document.getElementById('objective').value.trim();
    if (objective) {
      addSectionTitle('Objective');
      addWrappedText(objective);
      y += 6;
    }

    // education
    const degree = document.getElementById('degree').value.trim();
    const school = document.getElementById('school').value.trim();
    const graduation = document.getElementById('graduation').value.trim();
    if (degree || school || graduation) {
      addSectionTitle('Education');
      addWrappedText(`${degree} from ${school}, ${graduation}`);
      y += 6;
    }

    // experience
    const role = document.getElementById('role').value.trim();
    const company = document.getElementById('company').value.trim();
    const duration = document.getElementById('duration').value.trim();
    const description = document.getElementById('description').value.trim();
    if (role || company || description) {
      addSectionTitle('Experience');
      addWrappedText(`${role} at ${company}, ${duration}`);
      if (description) addWrappedText(description);
      y += 6;
    }

    // projects
    const project1 = document.getElementById('project1').value.trim();
    const project1desc = document.getElementById('project1desc').value.trim();
    const project2 = document.getElementById('project2').value.trim();
    const project2desc = document.getElementById('project2desc').value.trim();
    if (project1 || project2) {
      addSectionTitle('Projects');
      if (project1) {
        addWrappedText(`${project1}: ${project1desc}`);
      }
      if (project2) {
        addWrappedText(`${project2}: ${project2desc}`);
      }
      y += 6;
    }

    // honors
    const honors = document.getElementById('honors').value.trim();
    if (honors) {
      addSectionTitle('Honors & Awards');
      addWrappedText(honors);
      y += 6;
    }

    // hobbies
    const hobbies = (document.getElementById('hobbies').value || '').split(',').map(h => h.trim()).filter(Boolean);
    if (hobbies.length) {
      addSectionTitle('Hobbies');
      addWrappedText(hobbies.join(', '));
      y += 6;
    }

    // skills
    const skills = (document.getElementById('skills').value || '').split(',').map(s => s.trim()).filter(Boolean);
    if (skills.length) {
      addSectionTitle('Skills');
      // print skills as comma separated (so space is saved)
      addWrappedText(skills.join(', '));
      y += 6;
    }

    // save
    doc.save((name ? name.replace(/\s+/g, '_') : 'resume') + '.pdf');
  });

  // small helpers
  function escapeHtml(text) {
    if (!text) return '';
    return text
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function escapeLink(text) {
    if (!text) return '-';
    // basic check: if looks like email show mailto link
    if (text.includes('@') && !text.startsWith('http')) {
      return `<a href="mailto:${escapeHtml(text)}">${escapeHtml(text)}</a>`;
    }
    return linkOrText(text);
  }

  function linkOrText(text) {
    if (!text) return '-';
    try {
      // ensure simple safety: only allow http/https links
      const url = new URL(text.includes('://') ? text : `https://${text}`);
      const href = (url.protocol === 'http:' || url.protocol === 'https:') ? url.href : text;
      return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(text)}</a>`;
    } catch (err) {
      return escapeHtml(text);
    }
  }
});
