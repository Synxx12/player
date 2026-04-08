import { html } from 'lit-html';
import { computed, signal, type ReadSignal } from 'maverick.js';
import { isFunction, unwrap } from 'maverick.js/std';

import { useDefaultLayoutContext } from '../../../../../../components/layouts/default/context';
import type { MenuPlacement } from '../../../../../../components/ui/menu/menu-items';
import type { TooltipPlacement } from '../../../../../../components/ui/tooltip/tooltip-content';
import { useMediaState } from '../../../../../../core/api/media-context';
import { $signal } from '../../../../../lit/directives/signal';
import { IconSlot } from '../../slots';
import { MenuPortal } from './menu-portal';

export function DefaultEpisodesMenu({
  placement,
  portal,
  tooltip,
}: {
  portal?: boolean;
  tooltip: TooltipPlacement | ReadSignal<TooltipPlacement>;
  placement: MenuPlacement | ReadSignal<MenuPlacement | null>;
}) {
  return $signal(() => {
    const { viewType } = useMediaState(),
      {
        episodes,
        episodesTitle,
        menuPortal,
        noModal,
        menuGroup,
        smallWhen: smWhen,
      } = useDefaultLayoutContext(),
      list = episodes() ?? [];

    const $placement = computed(() =>
        noModal() ? unwrap(placement) : !smWhen() ? unwrap(placement) : null,
      ),
      $offset = computed(() =>
        !smWhen() && menuGroup() === 'bottom' && viewType() === 'video' ? 26 : 0,
      ),
      $isOpen = signal(false);

    function onOpen(event: Event) {
      $isOpen.set(true);
      (event.currentTarget as HTMLElement | null)?.dispatchEvent(
        new CustomEvent('vds-episodes-open', { bubbles: true, composed: true }),
      );
    }

    function onClose() {
      $isOpen.set(false);
    }

    const items = html`
      <media-menu-items
        class="vds-episodes-menu-items vds-menu-items"
        placement=${$signal($placement)}
        offset=${$signal($offset)}
      >
        ${$signal(() => {
          if (!$isOpen()) return null;
          return html`
            <div class="vds-episodes-panel-header">
              <span class="vds-episodes-panel-title">${episodesTitle()}</span>
            </div>
            ${list.length
              ? html`
                  <div class="vds-episodes-list" role="list">
                    ${list.map((episode, index) => {
                      const episodeName =
                          episode.episodeTitle || `Episode ${episode.episodeNumber ?? index + 1}`,
                        runtimeText = Number.isFinite(episode.runtime)
                          ? `${episode.runtime} min left`
                          : null;
                      return html`
                        <article class="vds-episode-item" role="listitem">
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
                            : html`<div
                                class="vds-episode-thumb vds-episode-thumb-placeholder"
                              ></div>`}
                          <div class="vds-episode-body">
                            <h4 class="vds-episode-title" title=${episode.title || ''}>
                              ${episode.title || '-'}
                            </h4>
                            <p class="vds-episode-subtitle" title=${episodeName}>${episodeName}</p>
                            ${runtimeText
                              ? html`<p class="vds-episode-meta">${runtimeText}</p>`
                              : null}
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
                `
              : html`<div class="vds-episodes-empty">Episodes belum tersedia.</div>`}
          `;
        })}
      </media-menu-items>
    `;

    return html`
      <media-menu class="vds-episodes-menu vds-menu" @open=${onOpen} @close=${onClose}>
        <media-tooltip class="vds-tooltip">
          <media-tooltip-trigger>
            <media-menu-button class="vds-episode-button vds-button" aria-label="Episodes">
              ${IconSlot('menu-episodes')}
            </media-menu-button>
          </media-tooltip-trigger>
          <media-tooltip-content
            class="vds-tooltip-content"
            placement=${isFunction(tooltip) ? $signal(tooltip) : tooltip}
          >
            Episodes
          </media-tooltip-content>
        </media-tooltip>
        ${portal ? MenuPortal(menuPortal, items) : items}
      </media-menu>
    `;
  });
}
