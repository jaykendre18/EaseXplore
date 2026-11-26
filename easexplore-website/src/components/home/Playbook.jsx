import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Container from '@/components/ui/Container';
import Icon from '@/components/ui/Icon';
import SectionHeading from '@/components/ui/SectionHeading';
import { PLAYBOOK } from '@/data/home';

const ICON_TONES = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  tertiary: 'text-tertiary',
};

export default function Playbook() {
  return (
    <section className="bg-surface-container-low py-12" aria-labelledby="playbook-title">
      <Container>
        <SectionHeading
          id="playbook-title"
          align="center"
          tone="secondary"
          eyebrow="Local savvy"
          title="The Puneri commuter playbook"
          description="Three unwritten street rules every smart visitor should know before stepping into town."
          className="mb-10"
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {PLAYBOOK.map((rule) => (
            <Card key={rule.badge} as="article" padding="none" className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <Badge tone={rule.tone} uppercase>
                  {rule.badge}
                </Badge>
                <Icon name={rule.icon} className={ICON_TONES[rule.tone]} />
              </div>
              <h3 className="mb-2 text-headline-sm text-on-surface">{rule.title}</h3>
              <p className="text-body-sm leading-relaxed text-on-surface-variant">{rule.text}</p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
