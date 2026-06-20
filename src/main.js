import './styles.css';

const checks = [
  ['GitHub account', 'takasaito-dev'],
  ['Repository', 'codex-web-demos'],
  ['Deploy target', 'GitHub Pages'],
];

document.querySelector('#app').innerHTML = `
  <section class="shell">
    <div class="hero">
      <p class="eyebrow">Codex Demo Workspace</p>
      <h1>Ready to publish.</h1>
      <p class="lead">Website demos built here can be pushed to GitHub and opened from a public preview URL.</p>
    </div>
    <div class="panel" aria-label="Setup status">
      ${checks
        .map(
          ([label, value]) => `
            <div class="row">
              <span>${label}</span>
              <strong>${value}</strong>
            </div>
          `,
        )
        .join('')}
    </div>
  </section>
`;

