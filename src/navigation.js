const header = document.querySelector('.header');
const toggle = header?.querySelector('.menu-toggle');
const navigation = header?.querySelector('.navigation');
if (toggle && navigation) {
  const phone = matchMedia('(max-width: 700px)');
  const language = header.querySelector('.language');
  function setOpen(open) {
    toggle.setAttribute('aria-expanded', String(open));
    navigation.hidden = phone.matches && !open;
    if (language) language.hidden = phone.matches && !open;
  }
  function reset() { toggle.hidden = !phone.matches; setOpen(false); }
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  navigation.addEventListener('click', event => { if (event.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false); toggle.focus();
    }
  });
  document.addEventListener('click', event => { if (!header.contains(event.target)) setOpen(false); });
  phone.addEventListener('change', reset);
  reset();
}
