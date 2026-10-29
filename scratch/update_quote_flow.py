with open('script.js', 'r', encoding='utf-8') as f:
    c = f.read()

target = '''      const wall = valWallColor ? valWallColor.textContent : '';
      const wood = valWood ? valWood.textContent : '';
      const trim = valTrim ? valTrim.textContent : '';

      // Pre-select service in modal
      const serviceName = room ? room.service : 'Full Home Interiors';
      openModal(serviceName);

      // Pre-fill location or details in form if available
      const descInput = document.getElementById('modalService');
      const form = document.getElementById('modalQuoteForm');
      if (form) {
        let summaryEl = document.getElementById('studioQuoteSummary');
        if (!summaryEl) {
          summaryEl = document.createElement('div');
          summaryEl.id = 'studioQuoteSummary';
          summaryEl.style.cssText = 'background: #FAF8F5; border: 1px solid #C59B4B; border-radius: 8px; padding: 10px 14px; margin-bottom: 14px; font-size: 12px; color: #123451;';
          const header = form.querySelector('.modal-header');
          if (header && header.nextSibling) {
            form.insertBefore(summaryEl, header.nextSibling);
          } else {
            form.prepend(summaryEl);
          }
        }
        summaryEl.innerHTML = `<strong>Selected Design:</strong> ${room ? room.name : 'Interior'} · <em>${preset ? preset.name : 'Custom'} Palette</em> (${wall} walls, ${wood} millwork, ${trim} accents)`;
      }'''

replacement = '''      let detailSummary = '';
      if (studioActiveRoom === 'kitchen') {
        const upper = valKitchenUpper ? valKitchenUpper.textContent : 'Custom';
        const lower = valKitchenLower ? valKitchenLower.textContent : 'Custom';
        const counter = valKitchenCounter ? valKitchenCounter.textContent : 'Custom';
        detailSummary = `(${upper} upper, ${lower} lower, ${counter} counter)`;
      } else if (studioActiveRoom === 'living') {
        const wall = valLivingWall ? valLivingWall.textContent : 'Custom';
        const sofa = valLivingSofa ? valLivingSofa.textContent : 'Custom';
        const media = valLivingAccent ? valLivingAccent.textContent : 'Custom';
        detailSummary = `(${wall} walls, ${sofa} sofa, ${media} media wall)`;
      } else {
        const wall = valWallColor ? valWallColor.textContent : '';
        const wood = valWood ? valWood.textContent : '';
        const trim = valTrim ? valTrim.textContent : '';
        detailSummary = `(${wall} walls, ${wood} millwork, ${trim} accents)`;
      }

      // Pre-select service in modal
      const serviceName = room ? room.service : 'Full Home Interiors';
      openModal(serviceName);

      // Pre-fill location or details in form if available
      const descInput = document.getElementById('modalService');
      const form = document.getElementById('modalQuoteForm');
      if (form) {
        let summaryEl = document.getElementById('studioQuoteSummary');
        if (!summaryEl) {
          summaryEl = document.createElement('div');
          summaryEl.id = 'studioQuoteSummary';
          summaryEl.style.cssText = 'background: #FAF8F5; border: 1px solid #C59B4B; border-radius: 8px; padding: 10px 14px; margin-bottom: 14px; font-size: 12px; color: #123451;';
          const header = form.querySelector('.modal-header');
          if (header && header.nextSibling) {
            form.insertBefore(summaryEl, header.nextSibling);
          } else {
            form.prepend(summaryEl);
          }
        }
        summaryEl.innerHTML = `<strong>Selected Design:</strong> ${room ? room.name : 'Interior'} · <em>${preset ? preset.name : 'Custom'} Palette</em> ${detailSummary}`;
      }'''

if target in c:
    c = c.replace(target, replacement)
    with open('script.js', 'w', encoding='utf-8') as f:
        f.write(c)
    print('Quote flow updated!')
else:
    print('Target not matched in quote flow')

