import { useState } from 'react';
import { InternalFlex, InternalText } from '@tgdf';

import { Button, Text, Dropdown } from 'UI';

import { COLORS } from '../../constants';
import { BackToViewLayout } from '../layouts/BackToViewLayout';
import { PanelScalable } from '../components/PanelScalable/PanelScalable';

const TEXT_SIZES = ['sm', 'md', 'lg', 'xl', 'xxl'] as const;
const DROPDOWN_OPTIONS = [
  { label: 'Option 1', value: 'option-1' },
  { label: 'Option 2', value: 'option-2' },
  { label: 'Option 3', value: 'option-3' },
];
const TEXT_COLOR_SAMPLES = [
  { name: 'Font color primary', value: COLORS.FONT_COLOR_PRIMARY },
  { name: 'Font color highlight', value: COLORS.FONT_COLOR_HIGHLIGHT },
  { name: 'Font color dimmed', value: COLORS.FONT_COLOR_DIMMED },
  { name: 'Golden', value: COLORS.GOLDEN },
] as const;

type ComponentSectionProps = {
  title: string;
  children: React.ReactNode;
};

function ComponentSection({ title, children }: ComponentSectionProps) {
  return (
    <InternalFlex
      direction="column"
      align="center"
      gap={15}
      style={{ width: '100%', maxWidth: '800px' }}
    >
      <InternalText size="lg" weight="semibold" color={COLORS.FONT_COLOR_PRIMARY}>
        {title}
      </InternalText>
      <InternalFlex
        direction="column"
        align="center"
        justify="center"
        gap={15}
        style={{
          width: '100%',
          padding: '20px',
          border: `1px solid ${COLORS.FONT_COLOR_DIMMED}`,
          background: COLORS.BG_COLOR_HIGHLIGHTED,
        }}
      >
        {children}
      </InternalFlex>
    </InternalFlex>
  );
}

export function ComponentsView() {
  const [dropdownValue, setDropdownValue] = useState<string | undefined>(undefined);

  return (
    <BackToViewLayout backToView="MenuView">
      <InternalFlex
        direction="column"
        align="center"
        gap={40}
        style={{
          height: '100vh',
          width: '100vw',
          padding: '80px 20px',
          backgroundColor: COLORS.BG_COLOR,
          overflow: 'auto',
        }}
      >
        <InternalText size="xl" weight="bold" color={COLORS.FONT_COLOR_PRIMARY}>
          Components
        </InternalText>

        <ComponentSection title="Button">
          <InternalFlex gap={20} align="center">
            <Button label="Button" onClick={() => {}} />
            <Button label="Disabled" onClick={() => {}} disabled />
          </InternalFlex>
        </ComponentSection>

        <ComponentSection title="Dropdown">
          <InternalFlex gap={20} align="start">
            <Dropdown
              options={DROPDOWN_OPTIONS}
              value={dropdownValue}
              onChange={setDropdownValue}
              placeholder="Select..."
            />
            <Dropdown options={DROPDOWN_OPTIONS} placeholder="Disabled" disabled />
          </InternalFlex>
        </ComponentSection>

        <ComponentSection title="Panel">
          <InternalFlex gap={20} align="start" wrap="wrap">
            <PanelScalable>{''}</PanelScalable>

            <PanelScalable>
              <Text nowrap>Short</Text>
            </PanelScalable>

            <PanelScalable>
              <Text>A somewhat longer piece of panel content</Text>
            </PanelScalable>

            <PanelScalable style={{ width: '300px' }}>
              <Text>
                This panel has an explicit width, so its content wraps across multiple lines while
                the border segments stretch to match.
              </Text>
            </PanelScalable>

            <PanelScalable>
              <Button label="Button" />
            </PanelScalable>
          </InternalFlex>
        </ComponentSection>

        <ComponentSection title="Text">
          <InternalFlex direction="column" align="start" gap={10}>
            {TEXT_SIZES.map((size) => (
              <Text key={size} size={size}>
                {size.toUpperCase()} — The quick brown fox
              </Text>
            ))}
          </InternalFlex>

          <InternalFlex direction="column" align="start" gap={10}>
            {TEXT_COLOR_SAMPLES.map(({ name, value }) => (
              <Text key={name} color={value}>
                {name} — {value}
              </Text>
            ))}
          </InternalFlex>
        </ComponentSection>
      </InternalFlex>
    </BackToViewLayout>
  );
}
