import { html } from 'lit-html';

import { useDefaultLayoutContext } from '../../../../../../components/layouts/default/context';
import { i18n } from '../../../../../../components/layouts/default/translations';
import { useMediaState } from '../../../../../../core/api/media-context';
import { $signal } from '../../../../../lit/directives/signal';
import { $i18n } from '../utils';
import { DefaultMenuButton } from './items/menu-items';

const LANG_FLAGS: Record<string, string> = {
  en: '🇬🇧',
  eng: '🇬🇧',
  english: '🇬🇧',
  id: '🇮🇩',
  ind: '🇮🇩',
  indonesian: '🇮🇩',
  ja: '🇯🇵',
  jpn: '🇯🇵',
  japanese: '🇯🇵',
  ko: '🇰🇷',
  kor: '🇰🇷',
  korean: '🇰🇷',
  zh: '🇨🇳',
  zho: '🇨🇳',
  chi: '🇨🇳',
  chinese: '🇨🇳',
  es: '🇪🇸',
  spa: '🇪🇸',
  spanish: '🇪🇸',
  fr: '🇫🇷',
  fra: '🇫🇷',
  french: '🇫🇷',
  de: '🇩🇪',
  deu: '🇩🇪',
  ger: '🇩🇪',
  german: '🇩🇪',
  pt: '🇧🇷',
  por: '🇧🇷',
  portuguese: '🇧🇷',
  ru: '🇷🇺',
  rus: '🇷🇺',
  russian: '🇷🇺',
  ar: '🇸🇦',
  ara: '🇸🇦',
  arabic: '🇸🇦',
  hi: '🇮🇳',
  hin: '🇮🇳',
  hindi: '🇮🇳',
  th: '🇹🇭',
  tha: '🇹🇭',
  thai: '🇹🇭',
  vi: '🇻🇳',
  vie: '🇻🇳',
  vietnamese: '🇻🇳',
  it: '🇮🇹',
  ita: '🇮🇹',
  italian: '🇮🇹',
  tr: '🇹🇷',
  tur: '🇹🇷',
  turkish: '🇹🇷',
  pl: '🇵🇱',
  pol: '🇵🇱',
  polish: '🇵🇱',
  nl: '🇳🇱',
  nld: '🇳🇱',
  dutch: '🇳🇱',
  ms: '🇲🇾',
  msa: '🇲🇾',
  malay: '🇲🇾',
};

function getFlagForLabel(label: string): string {
  const lower = label.toLowerCase().trim();
  // Check direct match first
  if (LANG_FLAGS[lower]) return LANG_FLAGS[lower];
  // Check if the label starts with a known language code
  for (const [key, flag] of Object.entries(LANG_FLAGS)) {
    if (lower.startsWith(key) || lower.includes(key)) return flag;
  }
  return '🏳️';
}

export function DefaultCaptionsMenu() {
  return $signal(() => {
    const { translations } = useDefaultLayoutContext(),
      { hasCaptions, textTracks } = useMediaState(),
      $offText = $i18n(translations, 'Off');

    if (!hasCaptions()) return null;

    return html`
      <media-menu class="vds-captions-menu vds-menu">
        ${DefaultMenuButton({
          label: () => i18n(translations, 'Captions'),
          icon: 'menu-captions',
        })}
        <media-menu-items class="vds-menu-items">
          <media-captions-radio-group
            class="vds-captions-radio-group vds-radio-group"
            off-label=${$offText}
          >
            <template>
              <media-radio class="vds-caption-radio vds-radio">
                <slot name="menu-radio-check-icon" data-class="vds-icon"></slot>
                <span class="vds-caption-flag" data-part="flag"></span>
                <span class="vds-radio-label" data-part="label"></span>
              </media-radio>
            </template>
          </media-captions-radio-group>
        </media-menu-items>
      </media-menu>
    `;
  });
}
