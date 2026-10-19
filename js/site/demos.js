/* Landing — live demos for every component in the gallery */
import { html, useState, Icon } from '../viscous/core.js';
import {
  GooeyNav, GooeyTabs, GooeyPagination, GooeyStepper,
  GooeyButton, GooeySwitch, GooeySlider, GooeyCheckbox, GooeyRadioGroup, GooeySearch,
  GooeyDialog, GooeyTooltip, GooeyMenu, GooeyFab, useToast,
  GooeyCard, GooeyCarousel, GooeyAccordion, GooeyLoader, GooeyBadge, GooeyAvatarGroup,
} from '../viscous/index.js';

const PEOPLE = [
  { name: 'Ada Lovelace' }, { name: 'Alan Turing' }, { name: 'Grace Hopper' },
  { name: 'Dieter Rams' }, { name: 'Massimo Vignelli' }, { name: 'Paula Scher' }, { name: 'Jony Ive' },
];

function NavDemo() {
  return html`<${GooeyNav} items=${[{ label: 'Home' }, { label: 'Work' }, { label: 'Notes' }, { label: 'About' }]} label="Demo navigation" />`;
}
function TabsDemo() {
  return html`<${GooeyTabs} label="Billing period" items=${[{ label: 'Daily' }, { label: 'Weekly' }, { label: 'Monthly' }]} defaultValue="Weekly" />`;
}
function PaginationDemo() {
  return html`<${GooeyPagination} count=${12} defaultPage=${4} />`;
}
function StepperDemo() {
  const [s, setS] = useState(1);
  return html`<div className="demo-stack demo-wide">
    <${GooeyStepper} current=${s} steps=${[{ label: 'Cart' }, { label: 'Shipping' }, { label: 'Payment' }, { label: 'Done' }]} />
    <div className="demo-row">
      <${GooeyButton} size="sm" variant="ghost" icon="arrowLeft" onClick=${() => setS((v) => Math.max(0, v - 1))}>Back<//>
      <${GooeyButton} size="sm" iconRight="arrowRight" onClick=${() => setS((v) => Math.min(3, v + 1))}>Next<//>
    </div>
  </div>`;
}
function ButtonDemo() {
  const [loading, setLoading] = useState(false);
  return html`<div className="demo-row demo-wrap">
    <${GooeyButton} iconRight="arrowRight">Get started<//>
    <${GooeyButton} variant="outline">Outline<//>
    <${GooeyButton} variant="ghost" icon="star">Ghost<//>
    <${GooeyButton} loading=${loading} onClick=${() => { setLoading(true); setTimeout(() => setLoading(false), 1800); }}>Save changes<//>
  </div>`;
}
function SwitchDemo() {
  return html`<div className="demo-stack">
    <${GooeySwitch} label="Airplane mode" />
    <${GooeySwitch} label="Dark appearance" defaultChecked iconOn="moon" iconOff="sun" />
    <${GooeySwitch} label="Compact" size="sm" defaultChecked />
  </div>`;
}
function SliderDemo() {
  return html`<div className="demo-stack demo-wide">
    <${GooeySlider} label="Viscosity" defaultValue=${62} format=${(v) => v + '%'} />
    <${GooeySlider} label="Temperature" min=${-20} max=${40} defaultValue=${21} format=${(v) => v + '°'} />
  </div>`;
}
function CheckboxDemo() {
  return html`<div className="demo-stack">
    <${GooeyCheckbox} label="Ship it" description="Deploy when checks pass" defaultChecked />
    <${GooeyCheckbox} label="Notify the team" />
  </div>`;
}
function RadioDemo() {
  return html`<${GooeyRadioGroup}
    label="Plan"
    defaultValue="pro"
    options=${[
      { value: 'hobby', label: 'Hobby', description: 'Personal projects' },
      { value: 'pro', label: 'Pro', description: 'Teams up to 10' },
      { value: 'scale', label: 'Scale', description: 'Unlimited seats' },
    ]}
  />`;
}
function SearchDemo() {
  const toast = useToast();
  return html`<${GooeySearch} width=${300} placeholder="Search components…" onSubmit=${(q) => toast('Searching “' + q + '”', { icon: 'search' })} />`;
}
function DialogDemo() {
  const [open, setOpen] = useState(false);
  const toast = useToast();
  return html`<div>
    <${GooeyButton} variant="outline" onClick=${() => setOpen(true)}>Open dialog<//>
    <${GooeyDialog}
      open=${open}
      onOpenChange=${setOpen}
      title="Publish to production?"
      description="Your changes will be visible to every visitor. This deploy can be rolled back from the dashboard at any time."
      footer=${html`
        <${GooeyButton} variant="ghost" onClick=${() => setOpen(false)}>Cancel<//>
        <${GooeyButton} iconRight="arrowRight" onClick=${() => { setOpen(false); toast('Deployed', { description: 'viscous-ui is live' }); }}>Publish<//>`}
    />
  </div>`;
}
function ToastDemo() {
  const toast = useToast();
  const msgs = [
    ['Copied to clipboard', 'css/viscous.css', 'copy'],
    ['New message', 'Dieter: “Less, but better.”', 'mail'],
    ['Saved', 'All changes synced', 'check'],
  ];
  const [i, setI] = useState(0);
  return html`<${GooeyButton} icon="bell" onClick=${() => { const m = msgs[i % msgs.length]; toast(m[0], { description: m[1], icon: m[2], action: i % 3 === 1 ? { label: 'Reply' } : undefined }); setI(i + 1); }}>Trigger toast<//>`;
}
function TooltipDemo() {
  return html`<div className="demo-row">
    ${[['heart', 'Like'], ['bookmark', 'Save for later'], ['share', 'Share']].map(([ic, t]) => html`
      <${GooeyTooltip} key=${ic} content=${t}>
        <button type="button" className="demo-iconbtn" aria-label=${t}><${Icon} name=${ic} size=${18} /></button>
      <//>`)}
  </div>`;
}
function MenuDemo() {
  const toast = useToast();
  return html`<div className="demo-menu-host">
    <${GooeyMenu}
      label="Actions"
      icon="layers"
      onSelect=${(it) => toast(it.label, { icon: it.icon })}
      items=${[
        { label: 'Duplicate', icon: 'copy', shortcut: '⌘D' },
        { label: 'Share', icon: 'share', shortcut: '⌘S' },
        { label: 'Download', icon: 'download' },
        { label: 'Delete', icon: 'trash', danger: true },
      ]}
    />
  </div>`;
}
function FabDemo() {
  const toast = useToast();
  return html`<div className="demo-fab-host">
    <${GooeyFab}
      direction="radial"
      actions=${[
        { label: 'Photo', icon: 'image', onClick: () => toast('Photo', { icon: 'image' }) },
        { label: 'Music', icon: 'music', onClick: () => toast('Music', { icon: 'music' }) },
        { label: 'Message', icon: 'send', onClick: () => toast('Message', { icon: 'send' }) },
      ]}
    />
  </div>`;
}
function CardDemo() {
  return html`<div className="demo-cards">
    <${GooeyCard} eyebrow="Case study" title="Liquid checkout flow" action=${{ label: 'Open case study' }}>
      Conversion up 18% after replacing hard state changes with continuous motion.
    <//>
  </div>`;
}
function CarouselDemo() {
  const slides = ['Surface', 'Tension', 'Viscosity', 'Cohesion'].map((t, i) => html`
    <div className=${'demo-slide demo-slide--' + i}>
      <span className="demo-slide__n">0${i + 1}</span>
      <strong>${t}</strong>
    </div>`);
  return html`<div className="demo-wide"><${GooeyCarousel} slides=${slides} autoplay=${3800} label="Concepts" /></div>`;
}
function AccordionDemo() {
  return html`<div className="demo-wide"><${GooeyAccordion} defaultOpen=${[0]} items=${[
    { title: 'Is it accessible?', content: 'Every component renders native, labelled controls with full keyboard support.' },
    { title: 'Does it respect reduced motion?', content: 'Yes. Motion collapses to short fades under prefers-reduced-motion.' },
    { title: 'Can I theme it?', content: 'Swap a dozen CSS variables, or wrap a subtree in .vx-theme-light.' },
  ]} /></div>`;
}
function LoaderDemo() {
  return html`<div className="demo-row demo-loaders">
    <${GooeyLoader} variant="orbit" size="lg" />
    <${GooeyLoader} variant="morph" size="lg" />
    <${GooeyLoader} variant="drip" size="lg" />
  </div>`;
}
function BadgeDemo() {
  const [n, setN] = useState(3);
  return html`<div className="demo-row">
    <${GooeyBadge} count=${n}>
      <button type="button" className="demo-iconbtn demo-iconbtn--lg" aria-label="Notifications" onClick=${() => setN(n + 1)}><${Icon} name="bell" size=${20} /></button>
    <//>
    <${GooeyButton} size="sm" variant="ghost" onClick=${() => setN(0)}>Clear<//>
  </div>`;
}
function AvatarDemo() {
  return html`<${GooeyAvatarGroup} people=${PEOPLE} max=${4} size=${44} />`;
}

/* registry: drives the gallery, filters and the counts on the page */
export const DEMOS = [
  { id: 'nav', name: 'Navbar', component: 'GooeyNav', cat: 'Navigation', span: 2, Demo: NavDemo,
    code: `<GooeyNav\n  items={[{ label: 'Home' }, { label: 'Work' }, { label: 'Notes' }]}\n/>` },
  { id: 'tabs', name: 'Tabs', component: 'GooeyTabs', cat: 'Navigation', Demo: TabsDemo,
    code: `<GooeyTabs\n  items={[{ label: 'Daily' }, { label: 'Weekly' }]}\n  onChange={setPeriod}\n/>` },
  { id: 'buttons', name: 'Button', component: 'GooeyButton', cat: 'Inputs', span: 2, Demo: ButtonDemo,
    code: `<GooeyButton iconRight="arrowRight">Get started</GooeyButton>\n<GooeyButton variant="outline">Outline</GooeyButton>\n<GooeyButton loading>Saving</GooeyButton>` },
  { id: 'switch', name: 'Switch', component: 'GooeySwitch', cat: 'Inputs', Demo: SwitchDemo,
    code: `<GooeySwitch label="Airplane mode" />\n<GooeySwitch iconOn="moon" iconOff="sun" />` },
  { id: 'slider', name: 'Slider', component: 'GooeySlider', cat: 'Inputs', Demo: SliderDemo,
    code: `<GooeySlider\n  label="Viscosity"\n  defaultValue={62}\n  format={(v) => v + '%'}\n/>` },
  { id: 'dialog', name: 'Dialog', component: 'GooeyDialog', cat: 'Overlays', Demo: DialogDemo,
    code: `<GooeyDialog\n  open={open}\n  onOpenChange={setOpen}\n  title="Publish to production?"\n  footer={<GooeyButton>Publish</GooeyButton>}\n/>` },
  { id: 'toast', name: 'Toast', component: 'useToast', cat: 'Overlays', Demo: ToastDemo,
    code: `const toast = useToast();\n\ntoast('Saved', {\n  description: 'All changes synced',\n});` },
  { id: 'menu', name: 'Dropdown', component: 'GooeyMenu', cat: 'Overlays', tall: true, Demo: MenuDemo,
    code: `<GooeyMenu\n  label="Actions"\n  items={[\n    { label: 'Duplicate', shortcut: '⌘D' },\n    { label: 'Delete', danger: true },\n  ]}\n/>` },
  { id: 'card', name: 'Card', component: 'GooeyCard', cat: 'Display', tall: true, Demo: CardDemo,
    code: `<GooeyCard\n  eyebrow="Case study"\n  title="Liquid checkout flow"\n  action={{ label: 'Open' }}\n>\n  Conversion up 18%…\n</GooeyCard>` },
  { id: 'fab', name: 'Speed dial', component: 'GooeyFab', cat: 'Overlays', tall: true, Demo: FabDemo,
    code: `<GooeyFab\n  direction="radial"\n  actions={[\n    { label: 'Photo', icon: 'image' },\n    { label: 'Music', icon: 'music' },\n  ]}\n/>` },
  { id: 'carousel', name: 'Carousel', component: 'GooeyCarousel', cat: 'Display', span: 2, Demo: CarouselDemo,
    code: `<GooeyCarousel\n  slides={slides}\n  autoplay={3800}\n/>` },
  { id: 'search', name: 'Search', component: 'GooeySearch', cat: 'Inputs', Demo: SearchDemo,
    code: `<GooeySearch\n  placeholder="Search…"\n  onSubmit={runQuery}\n/>` },
  { id: 'stepper', name: 'Stepper', component: 'GooeyStepper', cat: 'Navigation', span: 2, Demo: StepperDemo,
    code: `<GooeyStepper\n  current={step}\n  steps={[{ label: 'Cart' }, { label: 'Payment' }]}\n/>` },
  { id: 'tooltip', name: 'Tooltip', component: 'GooeyTooltip', cat: 'Overlays', Demo: TooltipDemo,
    code: `<GooeyTooltip content="Like">\n  <IconButton />\n</GooeyTooltip>` },
  { id: 'checkbox', name: 'Checkbox', component: 'GooeyCheckbox', cat: 'Inputs', Demo: CheckboxDemo,
    code: `<GooeyCheckbox\n  label="Ship it"\n  description="Deploy when checks pass"\n/>` },
  { id: 'radio', name: 'Radio group', component: 'GooeyRadioGroup', cat: 'Inputs', Demo: RadioDemo,
    code: `<GooeyRadioGroup\n  label="Plan"\n  options={plans}\n  onChange={setPlan}\n/>` },
  { id: 'pagination', name: 'Pagination', component: 'GooeyPagination', cat: 'Navigation', Demo: PaginationDemo,
    code: `<GooeyPagination\n  count={12}\n  page={page}\n  onChange={setPage}\n/>` },
  { id: 'accordion', name: 'Accordion', component: 'GooeyAccordion', cat: 'Display', span: 2, Demo: AccordionDemo,
    code: `<GooeyAccordion\n  items={[{ title: 'Is it accessible?', content: '…' }]}\n/>` },
  { id: 'loader', name: 'Loader', component: 'GooeyLoader', cat: 'Display', Demo: LoaderDemo,
    code: `<GooeyLoader variant="orbit" />\n<GooeyLoader variant="morph" />\n<GooeyLoader variant="drip" />` },
  { id: 'badge', name: 'Badge', component: 'GooeyBadge', cat: 'Display', Demo: BadgeDemo,
    code: `<GooeyBadge count={3}>\n  <BellButton />\n</GooeyBadge>` },
  { id: 'avatars', name: 'Avatar group', component: 'GooeyAvatarGroup', cat: 'Display', span: 2, Demo: AvatarDemo,
    code: `<GooeyAvatarGroup\n  people={team}\n  max={4}\n/>` },
];

export const CATEGORIES = ['All', 'Navigation', 'Inputs', 'Overlays', 'Display'];
