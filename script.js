const body = document.body;
const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');

menuButton.addEventListener('click', () => {
  const open = body.classList.toggle('menu-open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
});

navigation.addEventListener('click', event => {
  if (event.target.closest('a')) {
    body.classList.remove('menu-open');
    menuButton.setAttribute('aria-expanded', 'false');
  }
});

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 180);
}, { passive: true });

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));

function openDialog(dialog) {
  if (typeof dialog.showModal === 'function') {
    dialog.showModal();
    body.classList.add('modal-open');
  }
}

function closeDialog(dialog) {
  dialog.close();
  body.classList.remove('modal-open');
}

const detailsModal = document.querySelector('#details-modal');
document.querySelector('[data-details-open]').addEventListener('click', () => openDialog(detailsModal));
detailsModal.querySelector('[data-modal-close]').addEventListener('click', () => closeDialog(detailsModal));

const helpModal = document.querySelector('#help-modal');
document.querySelectorAll('[data-help-open]').forEach(button => {
  button.addEventListener('click', () => {
    if (body.classList.contains('menu-open')) {
      body.classList.remove('menu-open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Открыть меню');
    }
    openDialog(helpModal);
  });
});
helpModal.querySelector('[data-help-close]').addEventListener('click', () => closeDialog(helpModal));

const surveyModal = document.querySelector('#survey-modal');
const surveyForm = document.querySelector('#research-form');
const surveySteps = [...surveyForm.querySelectorAll('[data-survey-step]')];
const surveyCurrent = surveyModal.querySelector('[data-survey-current]');
const surveyProgress = surveyModal.querySelector('[data-survey-progress]');
const surveyBack = surveyModal.querySelector('[data-survey-back]');
const surveyNext = surveyModal.querySelector('[data-survey-next]');
const surveySubmit = surveyModal.querySelector('[data-survey-submit]');
const surveyControls = surveyModal.querySelector('[data-survey-controls]');
const surveySuccess = surveyModal.querySelector('[data-survey-success]');
let surveyStep = 0;

function renderSurveyStep() {
  surveySteps.forEach((step, index) => {
    step.hidden = index !== surveyStep;
    step.classList.toggle('active', index === surveyStep);
  });
  surveyCurrent.textContent = surveyStep + 1;
  surveyProgress.style.width = `${((surveyStep + 1) / surveySteps.length) * 100}%`;
  surveyBack.disabled = surveyStep === 0;
  surveyNext.hidden = surveyStep === surveySteps.length - 1;
  surveySubmit.hidden = surveyStep !== surveySteps.length - 1;
  surveyModal.scrollTo({ top: 0, behavior: 'smooth' });
}

function validateSurveyStep() {
  const step = surveySteps[surveyStep];
  const requiredInputs = [...step.querySelectorAll('[required]')];
  const fieldsValid = requiredInputs.every(input => {
    if (!input.checkValidity()) input.reportValidity();
    return input.checkValidity();
  });
  let groupsValid = true;

  step.querySelectorAll('[data-required-group]').forEach(group => {
    const checked = group.querySelector('input[type="checkbox"]:checked');
    group.classList.toggle('invalid', !checked);
    if (!checked) groupsValid = false;
  });

  return fieldsValid && groupsValid;
}

document.querySelector('[data-survey-open]').addEventListener('click', () => {
  surveyStep = 0;
  surveyForm.reset();
  surveySuccess.hidden = true;
  surveyControls.hidden = false;
  surveySteps.forEach(step => step.querySelectorAll('.invalid').forEach(item => item.classList.remove('invalid')));
  renderSurveyStep();
  openDialog(surveyModal);
});

surveyModal.querySelector('[data-survey-close]').addEventListener('click', () => closeDialog(surveyModal));
surveyBack.addEventListener('click', () => {
  if (surveyStep > 0) {
    surveyStep -= 1;
    renderSurveyStep();
  }
});
surveyNext.addEventListener('click', () => {
  if (validateSurveyStep() && surveyStep < surveySteps.length - 1) {
    surveyStep += 1;
    renderSurveyStep();
  }
});

surveyForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!validateSurveyStep()) return;
  surveySteps.forEach(step => { step.hidden = true; });
  surveyControls.hidden = true;
  surveySuccess.hidden = false;
  surveyModal.scrollTo({ top: 0, behavior: 'smooth' });
});

surveyModal.querySelector('[data-survey-finish]').addEventListener('click', () => closeDialog(surveyModal));

const gallery = [
  { src: '8.jpg', caption: 'Уличная экспозиция «Память о Героях СВО»' },
  { src: '9.jpg', caption: 'Посетители выставки' },
  { src: '14.jpg', caption: 'Выставка в учреждении культуры' },
  { src: '15.jpg', caption: 'Встреча со школьниками' },
  { src: '6.jpg', caption: 'Общественная встреча' },
  { src: '16.jpg', caption: 'Открытие экспозиции' },
  { src: '17.jpg', caption: 'Выездное мероприятие' },
  { src: '7.jpg', caption: 'Творческая программа' }
];

const galleryModal = document.querySelector('#gallery-modal');
const lightboxImage = document.querySelector('#lightbox-image');
const lightboxCaption = document.querySelector('#lightbox-caption');
let currentImage = 0;

function showImage(index) {
  currentImage = (index + gallery.length) % gallery.length;
  lightboxImage.src = gallery[currentImage].src;
  lightboxImage.alt = gallery[currentImage].caption;
  lightboxCaption.textContent = gallery[currentImage].caption;
}

document.querySelectorAll('[data-gallery-open]').forEach(button => {
  button.addEventListener('click', () => {
    showImage(0);
    openDialog(galleryModal);
  });
});

document.querySelectorAll('[data-image]').forEach(button => {
  button.addEventListener('click', () => {
    const index = gallery.findIndex(item => item.src === button.dataset.image);
    showImage(index < 0 ? 0 : index);
    openDialog(galleryModal);
  });
});

galleryModal.querySelector('[data-gallery-close]').addEventListener('click', () => closeDialog(galleryModal));
galleryModal.querySelector('[data-gallery-prev]').addEventListener('click', () => showImage(currentImage - 1));
galleryModal.querySelector('[data-gallery-next]').addEventListener('click', () => showImage(currentImage + 1));

document.addEventListener('keydown', event => {
  if (!galleryModal.open) return;
  if (event.key === 'ArrowLeft') showImage(currentImage - 1);
  if (event.key === 'ArrowRight') showImage(currentImage + 1);
});

[detailsModal, helpModal, surveyModal, galleryModal].forEach(dialog => {
  dialog.addEventListener('click', event => {
    if (event.target === dialog) closeDialog(dialog);
  });
  dialog.addEventListener('close', () => body.classList.remove('modal-open'));
});
