import { html } from 'lit-html';
import { computed, effect, signal } from 'maverick.js';

import { useDefaultLayoutContext } from '../../../../components/layouts/default/context';
import { useMediaState } from '../../../../core/api/media-context';
import { $signal } from '../../../lit/directives/signal';
import { DefaultAnnouncer } from './ui/announcer';
import {
  DefaultAirPlayButton,
  DefaultCaptionButton,
  DefaultDownloadButton,
  DefaultEpisodeButton,
  DefaultFullscreenButton,
  DefaultGoogleCastButton,
  DefaultPIPButton,
  DefaultPlayButton,
  DefaultSeekButton,
} from './ui/buttons';
import { DefaultCaptions } from './ui/captions';
import { DefaultControlsSpacer } from './ui/controls';
import { DefaultKeyboardDisplay } from './ui/keyboard-display';
import { DefaultChaptersMenu } from './ui/menu/chapters-menu';
import { DefaultSettingsMenu } from './ui/menu/settings-menu';
import { DefaultTimeSlider, DefaultVolumePopup } from './ui/slider';
import { DefaultTimeInfo } from './ui/time';
import { DefaultTitle } from './ui/title';

export function DefaultVideoLayoutLarge() {
  const { episodes, smallWhen: smWhen } = useDefaultLayoutContext(),
    { fullscreen } = useMediaState(),
    $episodesOpen = signal(false);

  effect(() => {
    if (!fullscreen()) $episodesOpen.set(false);
  });

  function onEpisodesToggle() {
    if ((!fullscreen() && !smWhen()) || !episodes()?.length) return;
    $episodesOpen.set(!$episodesOpen());
  }

  function onEpisodesClose() {
    $episodesOpen.set(false);
  }

  return [
    DefaultAnnouncer(),
    DefaultVideoGestures(),
    DefaultBufferingIndicator(),
    DefaultKeyboardDisplay(),
    DefaultCaptions(),
    html`<div class="vds-scrim"></div>`,
    html`
      <media-controls class="vds-controls" @vds-episodes-open=${onEpisodesToggle}>
        ${[
          DefaultControlsGroupTop(),
          DefaultControlsSpacer(),
          html`
            <media-controls-group class="vds-controls-group">
              ${DefaultTimeSlider()}
            </media-controls-group>
          `,
          html`
            <media-controls-group class="vds-controls-group vds-controls-group-bottom">
              ${[
                DefaultSeekButton({ backward: true, tooltip: 'top' }),
                DefaultPlayButton({ tooltip: 'top start' }),
                DefaultSeekButton({ backward: false, tooltip: 'top' }),
                DefaultVolumePopup({ orientation: 'horizontal', tooltip: 'top' }),
                DefaultTimeInfo(),
                DefaultTitle(),
                DefaultControlsSpacer(),
                $signal(() =>
                  (fullscreen() || smWhen()) && episodes()?.length
                    ? DefaultEpisodeButton({ tooltip: 'top' })
                    : null,
                ),
                DefaultCaptionButton({ tooltip: 'top' }),
                DefaultBottomMenuGroup(),
                DefaultDownloadButton(),
                DefaultPIPButton(),
                DefaultFullscreenButton({ tooltip: 'top end' }),
              ]}
            </media-controls-group>
          `,
        ]}
      </media-controls>
    `,
    DefaultEpisodesSidebar($episodesOpen, onEpisodesClose),
  ];
}

function DefaultBottomMenuGroup() {
  return $signal(() => {
    const { menuGroup } = useDefaultLayoutContext();
    return menuGroup() === 'bottom' ? DefaultVideoMenus() : null;
  });
}

function DefaultControlsGroupTop() {
  return html`
    <media-controls-group class="vds-controls-group">
      ${$signal(() => {
        const { menuGroup } = useDefaultLayoutContext();
        return menuGroup() === 'top' ? [DefaultControlsSpacer(), DefaultVideoMenus()] : null;
      })}
    </media-controls-group>
  `;
}

export function DefaultVideoLayoutSmall() {
  const { episodes, smallWhen: smWhen } = useDefaultLayoutContext(),
    { fullscreen } = useMediaState(),
    $episodesOpen = signal(false);

  effect(() => {
    if (!fullscreen()) $episodesOpen.set(false);
  });

  function onEpisodesToggle() {
    if ((!fullscreen() && !smWhen()) || !episodes()?.length) return;
    $episodesOpen.set(!$episodesOpen());
  }

  function onEpisodesClose() {
    $episodesOpen.set(false);
  }

  return [
    DefaultAnnouncer(),
    DefaultVideoGestures(),
    DefaultBufferingIndicator(),
    DefaultCaptions(),
    DefaultKeyboardDisplay(),
    html`<div class="vds-scrim"></div>`,
    html`
      <media-controls class="vds-controls" @vds-episodes-open=${onEpisodesToggle}>
        <media-controls-group class="vds-controls-group">
          ${[
            DefaultControlsSpacer(),
            DefaultCaptionButton({ tooltip: 'bottom' }),
            DefaultDownloadButton(),
            DefaultVideoMenus(),
            DefaultVolumePopup({ orientation: 'vertical', tooltip: 'bottom end' }),
          ]}
        </media-controls-group>

        ${DefaultControlsSpacer()}

        <media-controls-group class="vds-controls-group">
          ${DefaultTimeSlider()}
        </media-controls-group>

        <media-controls-group class="vds-controls-group vds-controls-group-bottom">
          ${[
            DefaultSeekButton({ backward: true, tooltip: 'top' }),
            DefaultPlayButton({ tooltip: 'top' }),
            DefaultSeekButton({ backward: false, tooltip: 'top' }),
            DefaultTimeInfo(),
            DefaultControlsSpacer(),
            $signal(() =>
              (fullscreen() || smWhen()) && episodes()?.length
                ? DefaultEpisodeButton({ tooltip: 'top' })
                : null,
            ),
            DefaultFullscreenButton({ tooltip: 'top end' }),
          ]}
        </media-controls-group>
      </media-controls>
    `,
    StartDuration(),
    DefaultEpisodesSidebar($episodesOpen, onEpisodesClose),
  ];
}

export function DefaultVideoLoadLayout() {
  return html`
    <div class="vds-load-container">
      ${[DefaultBufferingIndicator(), DefaultPlayButton({ tooltip: 'top' })]}
    </div>
  `;
}

function StartDuration() {
  return $signal(() => {
    const { duration } = useMediaState();

    if (duration() === 0) return null;

    return html`
      <div class="vds-start-duration">
        <media-time class="vds-time" type="duration"></media-time>
      </div>
    `;
  });
}

export function DefaultBufferingIndicator() {
  return html`
    <div class="vds-buffering-indicator">
      <media-spinner class="vds-buffering-spinner"></media-spinner>
    </div>
  `;
}

function DefaultEpisodesSidebar($open: () => boolean, onClose: () => void) {
  const { episodes, episodesTitle, smallWhen: smWhen } = useDefaultLayoutContext(),
    { fullscreen } = useMediaState();

  return $signal(() => {
    const list = episodes() ?? [];
    if ((!fullscreen() && !smWhen()) || !list.length) return null;

    return html`
      <div
        class="vds-episodes-backdrop"
        data-open=${$open() ? 'true' : 'false'}
        @pointerup=${(event: PointerEvent) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <aside
          class="vds-episodes-panel"
          data-open=${$open() ? 'true' : 'false'}
          @keydown=${(event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
          }}
        >
          <header class="vds-episodes-panel-header">
            <h3 class="vds-episodes-panel-title">${episodesTitle()}</h3>
            <button
              type="button"
              class="vds-episodes-close-btn"
              aria-label="Close episodes"
              @pointerup=${(event: Event) => {
                event.stopPropagation();
                onClose();
              }}
            >
              <span aria-hidden="true">✕</span>
            </button>
          </header>
          <div class="vds-episodes-list" role="list">
            ${list.map((episode, index) => {
              const episodeName =
                  episode.episodeTitle || `Episode ${episode.episodeNumber ?? index + 1}`,
                runtimeText = Number.isFinite(episode.runtime) ? `${episode.runtime}m` : null,
                seasonEpLabel =
                  episode.seasonNumber != null && episode.episodeNumber != null
                    ? `S${String(episode.seasonNumber).padStart(2, '0')} · E${String(
                        episode.episodeNumber,
                      ).padStart(2, '0')}`
                    : episodeName;

              const onEpisodeSelect = (event: Event) => {
                event.stopPropagation();
                (event.currentTarget as HTMLElement | null)?.dispatchEvent(
                  new CustomEvent('vds-episode-select', {
                    bubbles: true,
                    composed: true,
                    detail: { episode, index },
                  }),
                );
                onClose();
              };
              return html`
                <article
                  class="vds-episode-item"
                  role="button"
                  tabindex="0"
                  aria-label=${episode.title || episodeName}
                  @pointerup=${onEpisodeSelect}
                  @keydown=${(event: KeyboardEvent) => {
                    if (event.key === 'Enter' || event.key === ' ') onEpisodeSelect(event);
                  }}
                >
                  <div class="vds-episode-thumb-wrap">
                    ${episode.thumbnail
                      ? html`
                          <img
                            class="vds-episode-thumb"
                            src=${episode.thumbnail}
                            alt=${episode.title || episodeName}
                            loading="lazy"
                            decoding="async"
                          />
                        `
                      : html`<div class="vds-episode-thumb vds-episode-thumb-placeholder"></div>`}
                  </div>
                  <div class="vds-episode-body">
                    <div class="vds-episode-meta-row">
                      <span class="vds-episode-label">${seasonEpLabel}</span>
                      ${runtimeText
                        ? html`<span class="vds-episode-runtime">${runtimeText}</span>`
                        : null}
                    </div>
                    <h4 class="vds-episode-title" title=${episode.title || ''}>
                      ${episode.title || '-'}
                    </h4>
                    <p class="vds-episode-subtitle" title=${episodeName}>${episodeName}</p>
                    ${episode.overview
                      ? html`<p class="vds-episode-desc" title=${episode.overview}>
                          ${episode.overview}
                        </p>`
                      : null}
                  </div>
                </article>
              `;
            })}
          </div>
        </aside>
      </div>
    `;
  });
}

function DefaultVideoMenus() {
  const { menuGroup, smallWhen: smWhen } = useDefaultLayoutContext(),
    $side = () => (menuGroup() === 'top' || smWhen() ? 'bottom' : 'top'),
    $tooltip = computed(() => `${$side()} ${menuGroup() === 'top' ? 'end' : 'center'}` as const),
    $placement = computed(() => `${$side()} end` as const);

  return [
    DefaultChaptersMenu({ tooltip: $tooltip, placement: $placement, portal: true }),
    DefaultSettingsMenu({ tooltip: $tooltip, placement: $placement, portal: true }),
  ];
}

export function DefaultVideoGestures() {
  return $signal(() => {
    const { noGestures } = useDefaultLayoutContext();

    if (noGestures()) return null;

    return html`
      <div class="vds-gestures">
        <media-gesture class="vds-gesture" event="pointerup" action="toggle:paused"></media-gesture>
        <media-gesture
          class="vds-gesture"
          event="pointerup"
          action="toggle:controls"
        ></media-gesture>
        <media-gesture
          class="vds-gesture"
          event="dblpointerup"
          action="toggle:fullscreen"
        ></media-gesture>
        <media-gesture class="vds-gesture" event="dblpointerup" action="seek:-10"></media-gesture>
        <media-gesture class="vds-gesture" event="dblpointerup" action="seek:10"></media-gesture>
      </div>
    `;
  });
}
